import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(month: number, year: number) {
    return this.prisma.invoice.findMany({
      where: { month, year },
      include: { member: true },
    });
  }

  findOne(id: number) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: { member: true },
    });
  }

  async generateAll(month: number, year: number) {
    const settlements = await this.prisma.monthlySettlement.findMany({
      where: { month, year },
      include: { member: true },
    });

    const mess = await this.prisma.mess.findFirst();
    const settings = await this.prisma.setting.findFirst();

    const results: any[] = [];
    for (const settlement of settlements) {
      const existing = await this.prisma.invoice.findFirst({
        where: {
          member_id: settlement.member_id,
          month,
          year,
        },
      });

      if (existing) {
        results.push(existing);
        continue;
      }

      const invoice = await this.prisma.invoice.create({
        data: {
          settlement_id: settlement.id,
          member_id: settlement.member_id,
          month,
          year,
          pdf_path: `invoice-${settlement.member_id}-${month}-${year}.pdf`,
        },
        include: { member: true },
      });
      results.push(invoice);
    }

    return results;
  }

  async generatePdfBuffer(invoice: any): Promise<Buffer> {
    const settlement = await this.prisma.monthlySettlement.findUnique({
      where: { id: invoice.settlement_id },
      include: { member: true },
    });

    const mess = await this.prisma.mess.findFirst();
    const settings = await this.prisma.setting.findFirst();
    const currency = settings?.currency || 'BDT';

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[invoice.month - 1];

    const docDefinition = {
      content: [
        { text: mess?.name || 'Mess Invoice', style: 'header' },
        { text: `${mess?.address || ''}`, style: 'subheader' },
        { text: `Manager: ${mess?.manager_name || ''} | Phone: ${mess?.phone || ''}`, style: 'subheader' },
        { text: '\n' },
        { text: `Monthly Invoice - ${monthName} ${invoice.year}`, style: 'title' },
        { text: '\n' },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'Member Information\n', style: 'sectionHeader' },
                { text: `Name: ${settlement?.member?.name || ''}\n` },
                { text: `Email: ${settlement?.member?.email || ''}\n` },
                { text: `Phone: ${settlement?.member?.phone || ''}\n` },
                { text: `Room: ${settlement?.member?.room_no || ''}\n` },
              ],
            },
          ],
        },
        { text: '\n' },
        { text: 'Meal Summary', style: 'sectionHeader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Description', 'Count', 'Rate', 'Amount'],
              ['Meals', settlement?.meal_count?.toFixed(2) || '0', `${currency} ${settlement?.meal_rate?.toFixed(2) || '0'}`, `${currency} ${settlement?.meal_cost?.toFixed(2) || '0'}`],
              ['Utility Share', '', '', `${currency} ${settlement?.utility_share?.toFixed(2) || '0'}`],
              ['Payments', '', '', `-${currency} ${settlement?.payment_total?.toFixed(2) || '0'}`],
              [{ text: 'Total Due', bold: true }, '', '', { text: `${currency} ${settlement?.total_due?.toFixed(2) || '0'}`, bold: true }],
            ],
          },
        },
        { text: '\n' },
        { text: `Generated on: ${new Date().toLocaleDateString()}`, style: 'footer' },
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center' },
        subheader: { fontSize: 10, alignment: 'center' },
        title: { fontSize: 14, bold: true, alignment: 'center' },
        sectionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
        footer: { fontSize: 9, alignment: 'center', margin: [0, 20, 0, 0] },
      },
    };

    return new Promise((resolve, reject) => {
      const pdfDoc = (pdfMake as any).createPdf(docDefinition);
      pdfDoc.getBuffer((buffer: Buffer) => {
        resolve(buffer);
      });
    });
  }

  async sendEmail(id: number) {
    // Email sending logic is handled by the Email module
    // This is a placeholder for the invoice-specific email endpoint
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { member: true },
    });
    return invoice;
  }
}
