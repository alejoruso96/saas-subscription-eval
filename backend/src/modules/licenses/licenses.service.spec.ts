import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { DataSource, EntityManager, Repository } from 'typeorm';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.js';
import { Company } from '../companies/entities/company.entity.js';
import { User } from '../users/entities/user.entity.js';
import { License } from './entities/license.entity.js';
import { LicensesService } from './licenses.service.js';

const admin: AuthenticatedUser = {
  id: 'u-admin',
  email: 'admin@andeslogistica.com',
  role: Role.Admin,
  companyId: 'company-1',
};

const analyst: AuthenticatedUser = {
  ...admin,
  id: 'u-analyst',
  email: 'analista@andeslogistica.com',
  role: Role.User,
};

function setup(options?: {
  company?: Company | null;
  user?: User | null;
  existing?: License | null;
  assigned?: number;
}) {
  const company = options && 'company' in options ? options.company : companyFixture();
  const user = options && 'user' in options ? options.user : userFixture();
  const existing = options?.existing ?? null;
  const assigned = options?.assigned ?? 1;

  const companies = { findOne: vi.fn().mockResolvedValue(company) };
  const users = { findOne: vi.fn().mockResolvedValue(user) };
  const licenses = {
    findOne: vi.fn().mockResolvedValue(existing),
    count: vi.fn().mockResolvedValue(assigned),
    create: vi.fn((value) => value),
    save: vi.fn(async (value) => value),
  };

  const manager = {
    getRepository: (entity: unknown) => {
      if (entity === Company) return companies;
      if (entity === User) return users;
      if (entity === License) return licenses;
      throw new Error('Repositorio no esperado');
    },
  };

  const dataSource = {
    transaction: (work: (manager: EntityManager) => Promise<unknown>) =>
      work(manager as unknown as EntityManager),
  };

  return {
    service: new LicensesService(dataSource as unknown as DataSource),
    companies: companies as unknown as Repository<Company>,
    users: users as unknown as Repository<User>,
    licenses,
  };
}

function companyFixture(): Company {
  return {
    id: 'company-1',
    name: 'Andes Logística S.A.S.',
    planName: 'Business',
    contractedLimit: 120_000,
    licenseLimit: 10,
    alertThreshold: 0.8,
  };
}

function userFixture(): User {
  return {
    id: 'u-10',
    name: 'Tomás Beltrán',
    email: 'tomas.beltran@andeslogistica.com',
    passwordHash: 'hash',
    role: Role.User,
    companyId: 'company-1',
  };
}

describe('LicensesService', () => {
  it('asigna una licencia cuando hay cupo', async () => {
    const { service } = setup();

    const result = await service.assign(admin, 'u-10');

    expect(result).toMatchObject({
      id: 'lic-u-10',
      userId: 'u-10',
      status: 'active',
    });
    expect(result.assignedAt).toEqual(expect.any(String));
  });

  it('rechaza a quien no es administrador', async () => {
    const { service } = setup();

    await expect(service.assign(analyst, 'u-10')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rechaza un empleado inexistente', async () => {
    const { service } = setup({ user: null });

    await expect(service.assign(admin, 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rechaza una licencia que ya está activa', async () => {
    const { service } = setup({
      existing: {
        id: 'lic-u-10',
        userId: 'u-10',
        companyId: 'company-1',
        status: 'active',
        assignedAt: new Date(),
      },
    });

    await expect(service.assign(admin, 'u-10')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rechaza la asignación cuando el cupo está lleno', async () => {
    const { service } = setup({ assigned: 10 });

    await expect(service.assign(admin, 'u-10')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rechaza la asignación si la empresa no existe', async () => {
    const { service } = setup({ company: null });

    await expect(service.assign(admin, 'u-10')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
