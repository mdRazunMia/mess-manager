import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(
    @Query('member_id') memberId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.paymentsService.findAll(
      memberId ? Number(memberId) : undefined,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Post()
  create(@Body() data: any) {
    return this.paymentsService.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.paymentsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.remove(id);
  }
}
