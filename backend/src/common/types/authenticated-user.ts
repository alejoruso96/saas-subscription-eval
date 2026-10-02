import type { Role } from '../enums/role.enum.js';

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: Role;
  companyId: string;
};

export type SessionUser = AuthenticatedUser & {
  name: string;
};
