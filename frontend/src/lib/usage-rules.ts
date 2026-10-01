import type { Employee, Role, UsageSnapshot } from '@/types/domain';

export type AlertLevel = 'ok' | 'warning' | 'exceeded';

export function usageRatio(current: number, limit: number): number {
  if (limit <= 0) return 0;
  return current / limit;
}

export function alertLevel(ratio: number, threshold: number): AlertLevel {
  if (ratio >= 1) return 'exceeded';
  if (ratio >= threshold) return 'warning';
  return 'ok';
}

export function canManageLicenses(role: Role): boolean {
  return role === 'Admin';
}

export function canAssignLicense(
  usage: Pick<UsageSnapshot, 'assignedLicenses' | 'licenseLimit'>,
  employee: Pick<Employee, 'licenseStatus'>,
): { ok: true } | { ok: false; reason: string } {
  if (employee.licenseStatus === 'active') {
    return { ok: false, reason: 'Este empleado ya tiene una licencia activa.' };
  }

  if (usage.assignedLicenses >= usage.licenseLimit) {
    return {
      ok: false,
      reason: 'Se alcanzó el límite de licencias contratadas.',
    };
  }

  return { ok: true };
}
