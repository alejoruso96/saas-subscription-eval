import { ApiError } from '@/lib/api/errors';
import type {
  AssignLicenseResult,
  AuthResponse,
  Employee,
  SessionUser,
  UsagePoint,
  UsageSnapshot,
} from '@/types/domain';

const COMPANY_ID = '6f1c0a2e-1b4d-4a7e-9c31-0a9b2d4e6f80';

const admin: SessionUser = {
  id: 'u-admin',
  name: 'Camila Ríos',
  email: 'admin@andeslogistica.com',
  role: 'Admin',
  companyId: COMPANY_ID,
};

const analyst: SessionUser = {
  id: 'u-analyst',
  name: 'Julián Herrera',
  email: 'analista@andeslogistica.com',
  role: 'User',
  companyId: COMPANY_ID,
};

const accounts = new Map<string, { password: string; user: SessionUser }>([
  [admin.email, { password: 'Admin123!', user: admin }],
  [analyst.email, { password: 'User123!', user: analyst }],
]);

const LICENSE_LIMIT = 10;

let employees: Employee[] = [
  employee(admin, 'active', '2026-08-02T14:10:00.000Z'),
  employee(analyst, 'active', '2026-08-04T09:30:00.000Z'),
  employee(
    { id: 'u-3', name: 'Sara Mendoza', email: 'sara.mendoza@andeslogistica.com', role: 'User', companyId: COMPANY_ID },
    'active',
    '2026-08-11T16:00:00.000Z',
  ),
  employee(
    { id: 'u-4', name: 'Diego Pardo', email: 'diego.pardo@andeslogistica.com', role: 'User', companyId: COMPANY_ID },
    'active',
    '2026-08-18T11:20:00.000Z',
  ),
  employee(
    { id: 'u-5', name: 'Lucía Navarro', email: 'lucia.navarro@andeslogistica.com', role: 'User', companyId: COMPANY_ID },
    'active',
    '2026-08-21T08:05:00.000Z',
  ),
  employee(
    { id: 'u-6', name: 'Mateo Gil', email: 'mateo.gil@andeslogistica.com', role: 'User', companyId: COMPANY_ID },
    'active',
    '2026-09-01T13:40:00.000Z',
  ),
  employee(
    { id: 'u-7', name: 'Valentina Cruz', email: 'valentina.cruz@andeslogistica.com', role: 'User', companyId: COMPANY_ID },
    'active',
    '2026-09-03T10:15:00.000Z',
  ),
  employee(
    { id: 'u-8', name: 'Andrés Molina', email: 'andres.molina@andeslogistica.com', role: 'User', companyId: COMPANY_ID },
    'active',
    '2026-09-09T15:55:00.000Z',
  ),
  employee(
    { id: 'u-9', name: 'Elena Duarte', email: 'elena.duarte@andeslogistica.com', role: 'Admin', companyId: COMPANY_ID },
    'active',
    '2026-09-12T12:00:00.000Z',
  ),
  employee(
    { id: 'u-10', name: 'Tomás Beltrán', email: 'tomas.beltran@andeslogistica.com', role: 'User', companyId: COMPANY_ID },
    'unassigned',
    null,
  ),
  employee(
    { id: 'u-11', name: 'Irene Solano', email: 'irene.solano@andeslogistica.com', role: 'User', companyId: COMPANY_ID },
    'unassigned',
    null,
  ),
  employee(
    { id: 'u-12', name: 'Pablo Nieto', email: 'pablo.nieto@andeslogistica.com', role: 'User', companyId: COMPANY_ID },
    'unassigned',
    null,
  ),
];

function employee(
  user: SessionUser,
  licenseStatus: Employee['licenseStatus'],
  assignedAt: string | null,
): Employee {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    licenseStatus,
    assignedAt,
  };
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), 280);
  });
}

function sessionFromToken(token: string): SessionUser {
  const id = token.startsWith('mock.') ? token.slice(5) : '';
  const user = [admin, analyst].find((account) => account.id === id);
  if (!user) throw new ApiError(401, 'La sesión no es válida.');
  return user;
}

function buildSeries(now = new Date()): UsagePoint[] {
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - index));
    const requests = Math.round(2100 + index * 95 + Math.sin(index / 2) * 280);
    return {
      date: date.toISOString().slice(0, 10),
      requests: Math.max(requests, 0),
    };
  });
}

export function mockLogin(email: string, password: string): Promise<AuthResponse> {
  const account = accounts.get(email.trim().toLowerCase());
  if (!account || account.password !== password) {
    return Promise.reject(new ApiError(401, 'Correo o contraseña incorrectos.'));
  }

  return delay({
    accessToken: `mock.${account.user.id}`,
    user: account.user,
  });
}

export function mockGetUsage(token: string): Promise<UsageSnapshot> {
  const user = sessionFromToken(token);
  const series = buildSeries();
  const currentUsage = series.reduce((total, point) => total + point.requests, 0);
  const periodStart = series[0]?.date ?? '';
  const periodEnd = series.at(-1)?.date ?? '';

  return delay({
    companyId: user.companyId,
    companyName: 'Andes Logística S.A.S.',
    planName: 'Business',
    contractedLimit: 120_000,
    currentUsage,
    alertThreshold: 0.8,
    periodStart,
    periodEnd,
    licenseLimit: LICENSE_LIMIT,
    assignedLicenses: employees.filter((item) => item.licenseStatus === 'active').length,
    series,
  });
}

export function mockListUsers(token: string): Promise<Employee[]> {
  sessionFromToken(token);
  return delay(employees.map((item) => ({ ...item })));
}

export function mockAssignLicense(token: string, userId: string): Promise<AssignLicenseResult> {
  const actor = sessionFromToken(token);
  if (actor.role !== 'Admin') {
    return Promise.reject(new ApiError(403, 'Solo un administrador puede asignar licencias.'));
  }

  const target = employees.find((item) => item.id === userId);
  if (!target) return Promise.reject(new ApiError(404, 'El empleado no existe.'));
  if (target.licenseStatus === 'active') {
    return Promise.reject(new ApiError(409, 'Este empleado ya tiene una licencia activa.'));
  }

  const assigned = employees.filter((item) => item.licenseStatus === 'active').length;
  if (assigned >= LICENSE_LIMIT) {
    return Promise.reject(new ApiError(409, 'Se alcanzó el límite de licencias contratadas.'));
  }

  const assignedAt = new Date().toISOString();
  employees = employees.map((item) =>
    item.id === userId ? { ...item, licenseStatus: 'active', assignedAt } : item,
  );

  return delay({
    id: `lic-${userId}`,
    userId,
    assignedAt,
    status: 'active',
  });
}
