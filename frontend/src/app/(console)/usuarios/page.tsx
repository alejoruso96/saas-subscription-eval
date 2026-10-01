import { UsersPanel } from '@/components/users/users-panel';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Empleados',
};

export default function UsersPage() {
  return <UsersPanel />;
}
