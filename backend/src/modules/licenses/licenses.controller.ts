import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.js';
import { AssignLicenseDto } from './dto/assign-license.dto.js';
import { LicensesService } from './licenses.service.js';

@Controller({ path: 'licenses', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Post('assign')
  @Roles(Role.Admin)
  assign(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AssignLicenseDto,
  ) {
    return this.licensesService.assign(user, dto.userId);
  }
}
