import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MembersService } from './members.service';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.membersService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.findOne(id);
  }

  @Get(':id/payments')
  getPayments(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.getPayments(id);
  }

  @Get(':id/statement')
  getStatement(
    @Param('id', ParseIntPipe) id: number,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.membersService.getStatement(id, Number(month), Number(year));
  }

  @Post()
  create(@Body() data: any) {
    return this.membersService.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.membersService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.remove(id);
  }

  @Post(':id/toggle')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.toggleStatus(id);
  }
}
