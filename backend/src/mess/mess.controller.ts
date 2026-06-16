import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MessService } from './mess.service';

@Controller('mess')
export class MessController {
  constructor(private readonly messService: MessService) {}

  @Get()
  findAll() {
    return this.messService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.messService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.messService.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.messService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.messService.remove(id);
  }
}
