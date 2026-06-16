import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MealsService } from './meals.service';

@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  findAll(
    @Query('date') date?: string,
    @Query('member_id') memberId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    if (date) {
      return this.mealsService.findByDate(date);
    }
    if (memberId && month && year) {
      return this.mealsService.findByMemberMonth(Number(memberId), Number(month), Number(year));
    }
    return this.mealsService.findAll();
  }

  @Get('report')
  getMonthlyReport(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.mealsService.getMonthlyReport(Number(month), Number(year));
  }

  @Post()
  create(@Body() data: any) {
    return this.mealsService.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.mealsService.update(id, data);
  }

  @Post('bulk')
  createBulk(@Body() data: any[]) {
    return this.mealsService.createBulk(data);
  }
}
