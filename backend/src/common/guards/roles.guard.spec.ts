import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { Role } from '../enums/role.enum.js';
import { RolesGuard } from './roles.guard.js';

function contextFor(role?: Role): ExecutionContext {
  return {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({
      getRequest: () => ({
        user: role
          ? {
              id: 'u-1',
              email: 'a@b.com',
              role,
              companyId: 'company-1',
            }
          : undefined,
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deja pasar si la ruta no exige rol', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(contextFor(Role.User))).toBe(true);
  });

  it('deja pasar al administrador', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);

    expect(guard.canActivate(contextFor(Role.Admin))).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      expect.any(Function),
      expect.any(Function),
    ]);
  });

  it('bloquea a un usuario sin el rol', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);

    expect(() => guard.canActivate(contextFor(Role.User))).toThrow(ForbiddenException);
  });

  it('bloquea una petición sin sesión', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);

    expect(() => guard.canActivate(contextFor())).toThrow(ForbiddenException);
  });
});
