'use client';

import { useAuthHydrated } from '@/components/auth/use-auth-hydrated';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthHydrated();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) router.replace('/login');
  }, [hydrated, router, user]);

  if (!hydrated || !user) {
    return (
      <div className="grid min-h-full place-items-center text-sm text-muted">
        Comprobando sesión…
      </div>
    );
  }

  return children;
}
