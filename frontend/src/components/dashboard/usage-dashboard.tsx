'use client';

import { formatElapsed, formatNumber, formatPercent } from '@/lib/format';
import { alertLevel, usageRatio } from '@/lib/usage-rules';
import dynamic from 'next/dynamic';
import { memo, useEffect, useState } from 'react';
import { useUsage } from '@/hooks/use-usage';

const UsageChart = dynamic(
  () => import('@/components/dashboard/usage-chart').then((module) => module.UsageChart),
  {
    ssr: false,
    loading: () => <div className="h-72 animate-pulse rounded-2xl bg-line/70" />,
  },
);

export function UsageDashboard() {
  const { data, error, loading, updatedAt, reload } = useUsage();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 5000);
    return () => window.clearInterval(interval);
  }, []);

  if (loading && !data) {
    return <div className="h-80 animate-pulse rounded-3xl bg-line/60" />;
  }

  if (!data) {
    return (
      <section className="rounded-3xl border border-line bg-card p-6">
        <p className="text-sm text-danger">{error ?? 'Sin datos de consumo.'}</p>
        <button type="button" onClick={() => void reload()} className="mt-3 text-sm underline">
          Reintentar
        </button>
      </section>
    );
  }

  const ratio = usageRatio(data.currentUsage, data.contractedLimit);
  const level = alertLevel(ratio, data.alertThreshold);
  const licenseRatio = usageRatio(data.assignedLicenses, data.licenseLimit);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{data.planName}</p>
          <h1 className="font-serif text-4xl tracking-tight">{data.companyName}</h1>
        </div>
        <p className="text-sm text-muted">
          Actualizado {updatedAt ? formatElapsed(updatedAt) : '…'}
          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-sage" aria-hidden />
        </p>
      </div>

      {level !== 'ok' ? (
        <p
          role="status"
          className={`rounded-2xl px-4 py-3 text-sm ${level === 'exceeded' ? 'bg-danger/10 text-danger' : 'bg-warn/10 text-warn'}`}
        >
          {level === 'exceeded'
            ? 'La cuenta superó el límite de peticiones contratado.'
            : `El consumo llegó al ${formatPercent(ratio)}. El aviso se activa al ${formatPercent(data.alertThreshold)}.`}
        </p>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Consumo del periodo" value={formatNumber(data.currentUsage)} detail="peticiones" />
        <Kpi label="Límite contratado" value={formatNumber(data.contractedLimit)} detail="peticiones" />
        <Kpi label="Uso del plan" value={formatPercent(ratio)} detail={data.planName} />
        <Kpi
          label="Licencias"
          value={`${data.assignedLicenses}/${data.licenseLimit}`}
          detail="asignadas"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <article className="rounded-3xl border border-line bg-card p-5">
          <h2 className="font-serif text-2xl">Peticiones por día</h2>
          <p className="mb-4 text-sm text-muted">
            {data.periodStart} — {data.periodEnd}
          </p>
          <UsageChart series={data.series} />
        </article>
        <article className="rounded-3xl border border-line bg-card p-5">
          <h2 className="font-serif text-2xl">Cupo de licencias</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {data.licenseLimit - data.assignedLicenses} licencias disponibles antes de llegar al
            tope del contrato.
          </p>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-line" aria-hidden>
            <div className="h-full rounded-full bg-sage" style={{ width: `${Math.min(licenseRatio, 1) * 100}%` }} />
          </div>
          <p className="mt-3 text-sm">{formatPercent(licenseRatio)} del cupo</p>
        </article>
      </section>
    </div>
  );
}

const Kpi = memo(function Kpi({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-3xl border border-line bg-card px-4 py-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl tracking-tight">{value}</p>
      <p className="text-sm text-muted">{detail}</p>
    </article>
  );
});
