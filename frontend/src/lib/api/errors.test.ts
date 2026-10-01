import { describe, expect, it } from 'vitest';
import { extractErrorMessage } from './errors';

describe('extractErrorMessage', () => {
  it('reads a string error body', () => {
    expect(extractErrorMessage('Credenciales inválidas', 'fallback')).toBe(
      'Credenciales inválidas',
    );
  });

  it('reads Nest validation payloads with a message array', () => {
    expect(
      extractErrorMessage(
        { message: ['email must be an email', 'password should not be empty'], statusCode: 400 },
        'fallback',
      ),
    ).toBe('email must be an email, password should not be empty');
  });

  it('reads a nested message string', () => {
    expect(extractErrorMessage({ message: 'No autorizado' }, 'fallback')).toBe('No autorizado');
  });

  it('falls back when the payload has no message', () => {
    expect(extractErrorMessage({ statusCode: 500 }, 'Error interno')).toBe('Error interno');
  });
});
