'use client';

import { ApiError } from '@/lib/api/errors';
import { getUsage } from '@/lib/api/client';
import { usagePollMs } from '@/lib/config';
import { useAuthStore } from '@/stores/auth-store';
import type { UsageSnapshot } from '@/types/domain';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export function useUsage() {
  const token = useAuthStore((state) => state.token);
  const clear = useAuthStore((state) => state.clear);
  const router = useRouter();
  const [data, setData] = useState<UsageSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const snapshot = await getUsage(token);
      setData(snapshot);
      setError(null);
      setUpdatedAt(new Date());
    } catch (caught) {
      if (caught instanceof ApiError && caught.statusCode === 401) {
        clear();
        router.replace('/login');
        return;
      }
      setError(caught instanceof Error ? caught.message : 'No se pudo leer el consumo.');
    } finally {
      setLoading(false);
    }
  }, [clear, router, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, usagePollMs);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [load]);

  return { data, error, loading, updatedAt, reload: load };
}
