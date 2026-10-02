import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { Role } from '../../common/enums/role.enum.js';
import type { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import type { User } from '../users/entities/user.entity.js';

const user: User = {
  id: 'u-admin',
  name: 'Camila Ríos',
  email: 'admin@andeslogistica.com',
  passwordHash: 'hash',
  role: Role.Admin,
  companyId: 'company-1',
};

describe('AuthService', () => {
  const usersService = {
    findByEmail: vi.fn(),
    toSession: vi.fn((account: User) => ({
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      companyId: account.companyId,
    })),
  };
  const jwt = { signAsync: vi.fn().mockResolvedValue('token') };
  const service = new AuthService(
    usersService as unknown as UsersService,
    jwt as unknown as JwtService,
  );

  beforeEach(() => {
    vi.restoreAllMocks();
    usersService.findByEmail.mockReset();
    usersService.toSession.mockClear();
    jwt.signAsync.mockClear();
  });

  it('devuelve el token y la sesión sin el hash', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

    const result = await service.login({
      email: 'admin@andeslogistica.com',
      password: 'Admin123!',
    });

    expect(result.accessToken).toBe('token');
    expect(result.user).toEqual({
      id: 'u-admin',
      name: 'Camila Ríos',
      email: 'admin@andeslogistica.com',
      role: Role.Admin,
      companyId: 'company-1',
    });
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: 'u-admin',
      email: 'admin@andeslogistica.com',
      role: Role.Admin,
      companyId: 'company-1',
    });
  });

  it('rechaza credenciales desconocidas', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'nadie@andeslogistica.com', password: 'Admin123!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza una contraseña incorrecta', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    vi.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

    await expect(
      service.login({ email: user.email, password: 'mala' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
