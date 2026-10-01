import { apiBaseUrl, apiMode } from '@/lib/config';
import type {
  AssignLicenseResult,
  AuthResponse,
  Employee,
  UsageSnapshot,
} from '@/types/domain';
import { ApiError, extractErrorMessage } from './errors';
import { mockAssignLicense, mockGetUsage, mockListUsers, mockLogin } from './mock';

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string | null;
};

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' });
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = extractErrorMessage(
      payload && typeof payload === 'object' && 'error' in payload ? payload.error : payload,
      'No se pudo completar la solicitud.',
    );
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function login(email: string, password: string): Promise<AuthResponse> {
  if (apiMode === 'mock') return mockLogin(email, password);
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function getUsage(token: string): Promise<UsageSnapshot> {
  if (apiMode === 'mock') return mockGetUsage(token);
  return apiFetch<UsageSnapshot>('/usage', { token });
}

export function listUsers(token: string): Promise<Employee[]> {
  if (apiMode === 'mock') return mockListUsers(token);
  return apiFetch<Employee[]>('/users', { token });
}

export function assignLicense(token: string, userId: string): Promise<AssignLicenseResult> {
  if (apiMode === 'mock') return mockAssignLicense(token, userId);
  return apiFetch<AssignLicenseResult>('/licenses/assign', {
    method: 'POST',
    token,
    body: { userId },
  });
}
