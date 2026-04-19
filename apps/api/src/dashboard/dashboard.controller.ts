import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getDashboard(@Req() req: any) {
    return {
      message: 'Acesso permitido',
      user: req.user,
    };
  }
}
