import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ingresar',
};

export default function LoginPage() {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-ink px-8 py-10 text-paper lg:px-12">
        <p className="font-serif text-3xl">Meridiano</p>
        <div className="max-w-md py-12">
          <h1 className="font-serif text-5xl leading-tight tracking-tight">
            Licencias y consumo, en el mismo tablero.
          </h1>
          <p className="mt-4 text-sm leading-6 text-paper/70">
            Para administradores de cuentas corporativas que asignan licencias y vigilan el límite
            de la API.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.16em] text-paper/50">Módulo B2B</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <LoginForm />
      </section>
    </div>
  );
}
