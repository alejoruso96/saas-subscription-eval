import { UsageDashboard } from '@/components/dashboard/usage-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consumo',
};

export default function HomePage() {
  return <UsageDashboard />;
}
