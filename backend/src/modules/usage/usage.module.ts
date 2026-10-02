import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/entities/company.entity.js';
import { License } from '../licenses/entities/license.entity.js';
import { UsageRecord } from './entities/usage-record.entity.js';
import { UsageController } from './usage.controller.js';
import { UsageService } from './usage.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([UsageRecord, Company, License])],
  controllers: [UsageController],
  providers: [UsageService],
})
export class UsageModule {}
