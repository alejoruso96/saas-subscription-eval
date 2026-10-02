import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  const guard = new JwtAuthGuard();

  it('devuelve el usuario autenticado', () => {
    const user = { id: 'u-1' };

    expect(guard.handleRequest(null, user)).toBe(user);
  });

  it('traduce una sesión ausente a 401', () => {
    expect(() => guard.handleRequest(null, false)).toThrow(UnauthorizedException);
  });

  it('conserva una HttpException previa', () => {
    const error = new UnauthorizedException('token vencido');

    expect(() => guard.handleRequest(error, false)).toThrow(error);
  });

  it('no expone errores que no son HTTP', () => {
    expect(() => guard.handleRequest(new Error('boom'), false)).toThrow(
      'La sesión no es válida.',
    );
  });
});
