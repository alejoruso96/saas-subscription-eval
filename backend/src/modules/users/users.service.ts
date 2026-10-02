import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { SessionUser } from '../../common/types/authenticated-user.js';
import { License } from '../licenses/entities/license.entity.js';
import { User } from './entities/user.entity.js';

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  licenseStatus: 'active' | 'unassigned';
  assignedAt: string | null;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(License)
    private readonly licenses: Repository<License>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: email.trim().toLowerCase() })
      .getOne();
  }

  async listByCompany(companyId: string): Promise<Employee[]> {
    const [users, licenses] = await Promise.all([
      this.users.find({ where: { companyId }, order: { name: 'ASC' } }),
      this.licenses.find({ where: { companyId, status: 'active' } }),
    ]);
    const licenseByUser = new Map(
      licenses.map((license) => [license.userId, license]),
    );

    return users.map((user) => {
      const license = licenseByUser.get(user.id);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        licenseStatus: license ? 'active' : 'unassigned',
        assignedAt: license ? toIso(license.assignedAt) : null,
      };
    });
  }

  toSession(user: User): SessionUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };
  }
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
