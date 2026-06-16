import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('category_id') categoryId?: string,
  ) {
    return this.expensesService.findAll(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
      categoryId ? Number(categoryId) : undefined,
    );
  }

  @Get('categories')
  getCategories() {
    return this.expensesService.getCategories();
  }

  @Get('summary')
  getSummary(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.expensesService.getSummary(Number(month), Number(year));
  }

  @Post()
  create(@Body() data: any) {
    return this.expensesService.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.expensesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.remove(id);
  }
}
