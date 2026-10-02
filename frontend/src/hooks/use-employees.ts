'use client';

import { ApiError } from '@/lib/api/errors';
import { assignLicense, listUsers } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth-store';
import type { Employee } from '@/types/domain';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export function useEmployees() {
  const token = useAuthStore((state) => state.token);
  const clear = useAuthStore((state) => state.clear);
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setEmployees(await listUsers(token));
      setError(null);
    } catch (caught) {
      if (caught instanceof ApiError && caught.statusCode === 401) {
        clear();
        router.replace('/login');
        return;
      }
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar el directorio.');
    } finally {
      setLoading(false);
    }
  }, [clear, router, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const assign = useCallback(
    async (userId: string) => {
      if (!token) return;
      try {
        const result = await assignLicense(token, userId);
        setEmployees((current) =>
          current.map((employee) =>
            employee.id === userId
              ? { ...employee, licenseStatus: 'active', assignedAt: result.assignedAt }
              : employee,
          ),
        );
        const name = employees.find((employee) => employee.id === userId)?.name ?? 'el empleado';
        setNotice(`Licencia asignada a ${name}.`);
      } catch (caught) {
        if (caught instanceof ApiError && caught.statusCode === 401) {
          clear();
          router.replace('/login');
        }
        throw caught;
      }
    },
    [clear, employees, router, token],
  );

  return { employees, error, loading, notice, reload: load, assign };
}
