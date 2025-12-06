import { Controller, Get, UseGuards } from '@nestjs/common';
import { BlingService } from './bling.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';

@Controller('bling')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlingController {
  constructor(private blingService: BlingService) {}

  @Get('status')
  @Roles(UserRole.ADMIN)
  getStatus() {
    return {
      configured: this.blingService.isConfigured(),
      message: this.blingService.isConfigured()
        ? 'Bling API is configured'
        : 'Bling API key not set. Add BLING_API_KEY to environment variables.',
    };
  }

  @Get('sync/products')
  @Roles(UserRole.ADMIN)
  async syncProducts() {
    return await this.blingService.syncProducts();
  }
}
