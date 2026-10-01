'use client';

import { Button } from '@/components/ui/button';
import type { Employee } from '@/types/domain';
import { useEffect, useRef } from 'react';

type AssignLicenseDialogProps = {
  employee: Employee;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function AssignLicenseDialog({
  employee,
  pending,
  error,
  onClose,
  onConfirm,
}: AssignLicenseDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/40 px-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-title"
        className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl"
      >
        <h2 id="assign-title" className="font-serif text-3xl tracking-tight">
          Asignar licencia
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {employee.name} recibirá una licencia activa. La operación se rechaza si la empresa ya
          ocupó el cupo contratado.
        </p>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? 'Asignando…' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
