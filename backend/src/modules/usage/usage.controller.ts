import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.js';
import { UsageService } from './usage.service.js';

@Controller({ path: 'usage', version: '1' })
@UseGuards(JwtAuthGuard)
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get()
  getSnapshot(@CurrentUser() user: AuthenticatedUser) {
    return this.usageService.getSnapshot(user.companyId);
  }
}
