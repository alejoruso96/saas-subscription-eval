import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Company } from '../companies/entities/company.entity.js';
import { User } from '../users/entities/user.entity.js';
import { License } from './entities/license.entity.js';
import { LicensesController } from './licenses.controller.js';
import { LicensesService } from './licenses.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([License, User, Company])],
  controllers: [LicensesController],
  providers: [LicensesService, RolesGuard],
})
export class LicensesModule {}
