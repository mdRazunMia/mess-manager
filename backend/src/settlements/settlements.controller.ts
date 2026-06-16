import { Controller, Get, Post, Param, ParseIntPipe, Query } from '@nestjs/common';
import { SettlementsService } from './settlements.service';

@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get()
  findAll(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.settlementsService.findAll(Number(month), Number(year));
  }

  @Get(':memberId')
  findOne(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.settlementsService.findOne(memberId, Number(month), Number(year));
  }

  @Post('generate')
  generate(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.settlementsService.generate(Number(month), Number(year));
  }
}
