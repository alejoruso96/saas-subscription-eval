export const ROLES = ['Admin', 'User'] as const;

export type Role = (typeof ROLES)[number];

export type LicenseStatus = 'active' | 'unassigned';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId: string;
};

export type AuthResponse = {
  accessToken: string;
  user: SessionUser;
};

export type UsagePoint = {
  date: string;
  requests: number;
};

export type UsageSnapshot = {
  companyId: string;
  companyName: string;
  planName: string;
  contractedLimit: number;
  currentUsage: number;
  alertThreshold: number;
  periodStart: string;
  periodEnd: string;
  licenseLimit: number;
  assignedLicenses: number;
  series: UsagePoint[];
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: Role;
  licenseStatus: LicenseStatus;
  assignedAt: string | null;
};

export type AssignLicenseResult = {
  id: string;
  userId: string;
  assignedAt: string;
  status: 'active';
};
