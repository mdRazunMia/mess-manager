import { Controller, Get, Post, Param, ParseIntPipe, Query, Res } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Response } from 'express';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.invoicesService.findAll(Number(month), Number(year));
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const invoice = await this.invoicesService.findOne(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.id}.pdf"`);
    const pdfBuffer = await this.invoicesService.generatePdfBuffer(invoice);
    res.send(pdfBuffer);
  }

  @Post('generate')
  generate(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.invoicesService.generateAll(Number(month), Number(year));
  }

  @Post(':id/send')
  sendEmail(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.sendEmail(id);
  }
}
