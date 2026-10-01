'use client';

import { useAuthHydrated } from '@/components/auth/use-auth-hydrated';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/errors';
import { login } from '@/lib/api/client';
import { apiMode } from '@/lib/config';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState(apiMode === 'mock' ? 'admin@andeslogistica.com' : '');
  const [password, setPassword] = useState(apiMode === 'mock' ? 'Admin123!' : '');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (hydrated && user) router.replace('/');
  }, [hydrated, router, user]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const session = await login(email, password);
      setSession(session.accessToken, session.user);
      router.replace('/');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'No se pudo iniciar sesión.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
      <div>
        <h2 className="font-serif text-4xl tracking-tight">Ingresar</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Usa la cuenta de administrador de tu empresa para ver el consumo y asignar licencias.
        </p>
      </div>
      <label className="block text-sm">
        Correo
        <input
          required
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-line bg-card px-3 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        Contraseña
        <input
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-line bg-card px-3 outline-none focus:border-ink"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Ingresando…' : 'Entrar'}
      </Button>
      {apiMode === 'mock' ? (
        <div className="rounded-2xl border border-line bg-card px-4 py-3 text-xs leading-5 text-muted">
          <p className="font-medium text-foreground">Cuentas de demostración</p>
          <p>Admin: admin@andeslogistica.com / Admin123!</p>
          <p>Usuario: analista@andeslogistica.com / User123!</p>
        </div>
      ) : null}
    </form>
  );
}
