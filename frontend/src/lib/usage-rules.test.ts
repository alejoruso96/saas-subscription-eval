import { describe, expect, it } from 'vitest';
import {
  alertLevel,
  canAssignLicense,
  canManageLicenses,
  usageRatio,
} from './usage-rules';

describe('usageRatio', () => {
  it('returns 0 when the contracted limit is not positive', () => {
    expect(usageRatio(10, 0)).toBe(0);
  });

  it('returns current usage divided by the limit', () => {
    expect(usageRatio(80, 100)).toBe(0.8);
  });
});

describe('alertLevel', () => {
  it('stays ok below the threshold', () => {
    expect(alertLevel(0.79, 0.8)).toBe('ok');
  });

  it('warns at the threshold and before the hard limit', () => {
    expect(alertLevel(0.8, 0.8)).toBe('warning');
  });

  it('marks the account as exceeded at 100%', () => {
    expect(alertLevel(1, 0.8)).toBe('exceeded');
  });
});

describe('canManageLicenses', () => {
  it('allows only admins to assign licenses', () => {
    expect(canManageLicenses('Admin')).toBe(true);
    expect(canManageLicenses('User')).toBe(false);
  });
});

describe('canAssignLicense', () => {
  const capacity = { assignedLicenses: 9, licenseLimit: 10 };

  it('rejects an employee who already has a license', () => {
    expect(canAssignLicense(capacity, { licenseStatus: 'active' })).toEqual({
      ok: false,
      reason: 'Este empleado ya tiene una licencia activa.',
    });
  });

  it('rejects the assignment when the contracted cap is reached', () => {
    expect(
      canAssignLicense(
        { assignedLicenses: 10, licenseLimit: 10 },
        { licenseStatus: 'unassigned' },
      ),
    ).toEqual({
      ok: false,
      reason: 'Se alcanzó el límite de licencias contratadas.',
    });
  });

  it('allows the assignment when there is remaining capacity', () => {
    expect(canAssignLicense(capacity, { licenseStatus: 'unassigned' })).toEqual({
      ok: true,
    });
  });
});
