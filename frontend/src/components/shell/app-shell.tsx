'use client';

import { apiMode } from '@/lib/config';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/', label: 'Consumo' },
  { href: '/usuarios', label: 'Empleados' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);
  const [open, setOpen] = useState(false);

  function logout() {
    clear();
    router.replace('/login');
  }

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-ink px-5 py-6 text-paper transition lg:static lg:w-auto ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-paper/60">Licencias B2B</p>
        </div>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Principal">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm ${active ? 'bg-paper text-ink' : 'text-paper/80 hover:bg-white/10'}`}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-paper/60">{user?.role}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 text-sm text-paper/80 underline-offset-4 hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      {open ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-20 bg-ink/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <div className="min-w-0">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 lg:px-8">
          <button
            type="button"
            className="rounded-full border border-line px-3 py-1.5 text-sm lg:hidden"
            onClick={() => setOpen(true)}
          >
            Menú
          </button>
          <p className="hidden text-sm text-muted lg:block">Consola de la cuenta corporativa</p>
          {apiMode === 'mock' ? (
            <span className="rounded-full bg-warn/10 px-3 py-1 text-xs font-medium text-warn">
              Datos de demostración
            </span>
          ) : (
            <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-medium text-sage">
              API en vivo
            </span>
          )}
        </header>
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
