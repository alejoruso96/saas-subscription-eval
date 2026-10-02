import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Role } from '../../common/enums/role.enum.js';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.js';
import { Company } from '../companies/entities/company.entity.js';
import { User } from '../users/entities/user.entity.js';
import { License } from './entities/license.entity.js';

export type AssignLicenseResult = {
  id: string;
  userId: string;
  assignedAt: string;
  status: 'active';
};

@Injectable()
export class LicensesService {
  constructor(private readonly dataSource: DataSource) {}

  async assign(
    actor: AuthenticatedUser,
    userId: string,
  ): Promise<AssignLicenseResult> {
    if (actor.role !== Role.Admin) {
      throw new ForbiddenException(
        'Solo un administrador puede asignar licencias.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const company = await manager.getRepository(Company).findOne({
        where: { id: actor.companyId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!company) {
        throw new NotFoundException('La empresa no existe.');
      }

      const target = await manager.getRepository(User).findOne({
        where: { id: userId, companyId: actor.companyId },
      });
      if (!target) {
        throw new NotFoundException('El empleado no existe.');
      }

      const licenses = manager.getRepository(License);
      const existing = await licenses.findOne({ where: { userId } });
      if (existing) {
        throw new ConflictException(
          'Este empleado ya tiene una licencia activa.',
        );
      }

      const assigned = await licenses.count({
        where: { companyId: actor.companyId, status: 'active' },
      });
      if (assigned >= company.licenseLimit) {
        throw new ConflictException(
          'Se alcanzó el límite de licencias contratadas.',
        );
      }

      const assignedAt = new Date();
      const license = licenses.create({
        id: `lic-${userId}`,
        userId,
        companyId: actor.companyId,
        status: 'active',
        assignedAt,
      });
      const saved = await licenses.save(license);

      return {
        id: saved.id,
        userId: saved.userId,
        assignedAt: saved.assignedAt.toISOString(),
        status: 'active',
      };
    });
  }
}
