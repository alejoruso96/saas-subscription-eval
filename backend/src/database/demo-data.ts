import { Role } from '../common/enums/role.enum.js';

export const DEMO_COMPANY_ID = '6f1c0a2e-1b4d-4a7e-9c31-0a9b2d4e6f80';

export const DEMO_COMPANY = {
  id: DEMO_COMPANY_ID,
  name: 'Andes Logística S.A.S.',
  planName: 'Business',
  contractedLimit: 120_000,
  licenseLimit: 10,
  alertThreshold: 0.8,
};

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  password: string;
  licenseStatus: 'active' | 'unassigned';
  assignedAt: string | null;
};

const DIRECTORY_PASSWORD = 'unused-directory-password';

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'u-admin',
    name: 'Camila Ríos',
    email: 'admin@andeslogistica.com',
    role: Role.Admin,
    password: 'Admin123!',
    licenseStatus: 'active',
    assignedAt: '2026-08-02T14:10:00.000Z',
  },
  {
    id: 'u-analyst',
    name: 'Julián Herrera',
    email: 'analista@andeslogistica.com',
    role: Role.User,
    password: 'User123!',
    licenseStatus: 'active',
    assignedAt: '2026-08-04T09:30:00.000Z',
  },
  {
    id: 'u-3',
    name: 'Sara Mendoza',
    email: 'sara.mendoza@andeslogistica.com',
    role: Role.User,
    password: DIRECTORY_PASSWORD,
    licenseStatus: 'active',
    assignedAt: '2026-08-11T16:00:00.000Z',
  },
  {
    id: 'u-4',
    name: 'Diego Pardo',
    email: 'diego.pardo@andeslogistica.com',
    role: Role.User,
    password: DIRECTORY_PASSWORD,
    licenseStatus: 'active',
    assignedAt: '2026-08-18T11:20:00.000Z',
  },
  {
    id: 'u-5',
    name: 'Lucía Navarro',
    email: 'lucia.navarro@andeslogistica.com',
    role: Role.User,
    password: DIRECTORY_PASSWORD,
    licenseStatus: 'active',
    assignedAt: '2026-08-21T08:05:00.000Z',
  },
  {
    id: 'u-6',
    name: 'Mateo Gil',
    email: 'mateo.gil@andeslogistica.com',
    role: Role.User,
    password: DIRECTORY_PASSWORD,
    licenseStatus: 'active',
    assignedAt: '2026-09-01T13:40:00.000Z',
  },
  {
    id: 'u-7',
    name: 'Valentina Cruz',
    email: 'valentina.cruz@andeslogistica.com',
    role: Role.User,
    password: DIRECTORY_PASSWORD,
    licenseStatus: 'active',
    assignedAt: '2026-09-03T10:15:00.000Z',
  },
  {
    id: 'u-8',
    name: 'Andrés Molina',
    email: 'andres.molina@andeslogistica.com',
    role: Role.User,
    password: DIRECTORY_PASSWORD,
    licenseStatus: 'active',
    assignedAt: '2026-09-09T15:55:00.000Z',
  },
  {
    id: 'u-9',
    name: 'Elena Duarte',
    email: 'elena.duarte@andeslogistica.com',
    role: Role.Admin,
    password: DIRECTORY_PASSWORD,
    licenseStatus: 'active',
    assignedAt: '2026-09-12T12:00:00.000Z',
  },
  {
    id: 'u-10',
    name: 'Tomás Beltrán',
    email: 'tomas.beltran@andeslogistica.com',
    role: Role.User,
    password: DIRECTORY_PASSWORD,
    licenseStatus: 'unassigned',
    assignedAt: null,
  },
  {
    id: 'u-11',
    name: 'Irene Solano',
    email: 'irene.solano@andeslogistica.com',
    role: Role.User,
    password: DIRECTORY_PASSWORD,
    licenseStatus: 'unassigned',
    assignedAt: null,
  },
  {
    id: 'u-12',
    name: 'Pablo Nieto',
    email: 'pablo.nieto@andeslogistica.com',
    role: Role.User,
    password: DIRECTORY_PASSWORD,
    licenseStatus: 'unassigned',
    assignedAt: null,
  },
];

export type UsagePoint = {
  date: string;
  requests: number;
};

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildUsageSeries(now = new Date()): UsagePoint[] {
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - index));
    const requests = Math.round(2100 + index * 95 + Math.sin(index / 2) * 280);
    return {
      date: formatLocalDate(date),
      requests: Math.max(requests, 0),
    };
  });
}
