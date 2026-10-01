'use client';

import { useEmployees } from '@/hooks/use-employees';
import { formatDateTime } from '@/lib/format';
import { canAssignLicense, canManageLicenses } from '@/lib/usage-rules';
import { useAuthStore } from '@/stores/auth-store';
import { useUsage } from '@/hooks/use-usage';
import type { Employee } from '@/types/domain';
import dynamic from 'next/dynamic';
import { memo, useMemo, useState } from 'react';

const AssignLicenseDialog = dynamic(
  () => import('@/components/users/assign-license-dialog').then((module) => module.AssignLicenseDialog),
  { ssr: false },
);

type LicenseFilter = 'all' | 'active' | 'unassigned';
type SortKey = 'name' | 'role' | 'licenseStatus';

export function UsersPanel() {
  const role = useAuthStore((state) => state.user?.role ?? 'User');
  const { employees, error, loading, notice, assign } = useEmployees();
  const usage = useUsage();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LicenseFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [pending, setPending] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const manager = canManageLicenses(role);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return employees
      .filter((employee) => (filter === 'all' ? true : employee.licenseStatus === filter))
      .filter((employee) => {
        if (!normalized) return true;
        return (
          employee.name.toLowerCase().includes(normalized) ||
          employee.email.toLowerCase().includes(normalized)
        );
      })
      .sort((left, right) => {
        const result = left[sortKey].localeCompare(right[sortKey], 'es');
        return sortAsc ? result : -result;
      });
  }, [employees, filter, query, sortAsc, sortKey]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((current) => !current);
      return;
    }
    setSortKey(key);
    setSortAsc(true);
  }

  async function confirmAssign() {
    if (!selected || !usage.data) return;
    const decision = canAssignLicense(usage.data, selected);
    if (!decision.ok) {
      setDialogError(decision.reason);
      return;
    }
    setPending(true);
    setDialogError(null);
    try {
      await assign(selected.id);
      setSelected(null);
      void usage.reload();
    } catch (caught) {
      setDialogError(caught instanceof Error ? caught.message : 'No se pudo asignar la licencia.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Empleados</h1>
        <p className="mt-1 text-sm text-muted">
          {manager
            ? 'Asigna licencias dentro del cupo contratado.'
            : 'Puedes consultar el directorio. Solo un administrador asigna licencias.'}
        </p>
      </div>
      {notice ? <p className="text-sm text-sage">{notice}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm">
          <span className="sr-only">Buscar empleado</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o correo"
            className="h-10 w-full rounded-full border border-line bg-card px-4 sm:w-80"
          />
        </label>
        <div className="flex gap-2" role="group" aria-label="Filtrar por licencia">
          {(
            [
              ['all', 'Todos'],
              ['active', 'Con licencia'],
              ['unassigned', 'Sin licencia'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1.5 text-sm ${filter === value ? 'bg-ink text-paper' : 'bg-card text-foreground'}`}
              aria-pressed={filter === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-line bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <SortHeader label="Empleado" active={sortKey === 'name'} onClick={() => toggleSort('name')} />
              <th className="px-4 py-3 font-medium">Correo</th>
              <SortHeader label="Rol" active={sortKey === 'role'} onClick={() => toggleSort('role')} />
              <SortHeader
                label="Licencia"
                active={sortKey === 'licenseStatus'}
                onClick={() => toggleSort('licenseStatus')}
              />
              <th className="px-4 py-3 font-medium">Asignada</th>
              <th className="px-4 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-muted">
                  Cargando directorio…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-muted">
                  No hay empleados con ese criterio.
                </td>
              </tr>
            ) : (
              visible.map((employee) => (
                <EmployeeRow
                  key={employee.id}
                  employee={employee}
                  canAssign={
                    manager &&
                    usage.data !== null &&
                    canAssignLicense(usage.data, employee).ok
                  }
                  onAssign={() => {
                    setDialogError(null);
                    setSelected(employee);
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected ? (
        <AssignLicenseDialog
          employee={selected}
          pending={pending}
          error={dialogError}
          onClose={() => setSelected(null)}
          onConfirm={() => void confirmAssign()}
        />
      ) : null}
    </div>
  );
}

function SortHeader({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <th className="px-4 py-3 font-medium">
      <button type="button" onClick={onClick} className={active ? 'text-ink' : undefined}>
        {label}
      </button>
    </th>
  );
}

const EmployeeRow = memo(function EmployeeRow({
  employee,
  canAssign,
  onAssign,
}: {
  employee: Employee;
  canAssign: boolean;
  onAssign: () => void;
}) {
  const licensed = employee.licenseStatus === 'active';
  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3 font-medium">{employee.name}</td>
      <td className="px-4 py-3 text-muted">{employee.email}</td>
      <td className="px-4 py-3">{employee.role}</td>
      <td className="px-4 py-3">{licensed ? 'Activa' : 'Sin asignar'}</td>
      <td className="px-4 py-3 text-muted">
        {employee.assignedAt ? formatDateTime(employee.assignedAt) : '—'}
      </td>
      <td className="px-4 py-3">
        {licensed ? (
          <span className="text-muted">Asignada</span>
        ) : (
          <button
            type="button"
            onClick={onAssign}
            disabled={!canAssign}
            className="text-accent-ink underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
          >
            Asignar
          </button>
        )}
      </td>
    </tr>
  );
});
