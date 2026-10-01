const numberFormat = new Intl.NumberFormat('es-CO');

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatPercent(ratio: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(ratio);
}

export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(year, month - 1, day));
}

export function formatDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

export function formatElapsed(from: Date, now = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - from.getTime()) / 1000));
  if (seconds < 5) return 'ahora';
  if (seconds < 60) return `hace ${seconds} s`;
  const minutes = Math.round(seconds / 60);
  return `hace ${minutes} min`;
}
