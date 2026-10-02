import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { NodeEnv } from '../config/env.validation.js';
import { Company } from '../modules/companies/entities/company.entity.js';
import { License } from '../modules/licenses/entities/license.entity.js';
import { UsageRecord } from '../modules/usage/entities/usage-record.entity.js';
import { User } from '../modules/users/entities/user.entity.js';
import { DEMO_COMPANY, DEMO_USERS, buildUsageSeries } from './demo-data.js';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.config.get<string>('NODE_ENV') === NodeEnv.Test) return;
    if (!this.dataSource.isInitialized) return;

    const companies = this.dataSource.getRepository(Company);
    if ((await companies.count()) > 0) return;

    await this.seed();
    this.logger.log('Datos de demostración cargados.');
  }

  private async seed(): Promise<void> {
    const passwordHashes = new Map<string, string>();
    for (const user of DEMO_USERS) {
      if (!passwordHashes.has(user.password)) {
        passwordHashes.set(user.password, await bcrypt.hash(user.password, 10));
      }
    }

    const series = buildUsageSeries();

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Company).save(DEMO_COMPANY);
      await manager.getRepository(User).save(
        DEMO_USERS.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: passwordHashes.get(user.password) ?? '',
          role: user.role,
          companyId: DEMO_COMPANY.id,
        })),
      );
      await manager.getRepository(License).save(
        DEMO_USERS.filter((user) => user.licenseStatus === 'active').map(
          (user) => ({
            id: `lic-${user.id}`,
            userId: user.id,
            companyId: DEMO_COMPANY.id,
            status: 'active' as const,
            assignedAt: new Date(user.assignedAt ?? new Date().toISOString()),
          }),
        ),
      );
      await manager.getRepository(UsageRecord).save(
        series.map((point) => ({
          companyId: DEMO_COMPANY.id,
          date: point.date,
          requests: point.requests,
        })),
      );
    });
  }
}
