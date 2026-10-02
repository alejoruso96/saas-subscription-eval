import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../modules/companies/entities/company.entity.js';
import { License } from '../modules/licenses/entities/license.entity.js';
import { UsageRecord } from '../modules/usage/entities/usage-record.entity.js';
import { User } from '../modules/users/entities/user.entity.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Company, User, License, UsageRecord])],
  providers: [SeedService],
})
export class DatabaseModule {}
