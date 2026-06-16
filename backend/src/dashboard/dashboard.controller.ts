import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard() {
    return this.dashboardService.getDashboard();
  }

  @Get('stats')
  getStats(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.dashboardService.getStats(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }
}
