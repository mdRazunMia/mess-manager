import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SettlementsService } from '../settlements/settlements.service';
import { InvoicesService } from '../invoices/invoices.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AutomationService {
  constructor(
    private prisma: PrismaService,
    private settlementsService: SettlementsService,
    private invoicesService: InvoicesService,
    private emailService: EmailService,
  ) {}

  @Cron('0 59 23 28-31 * *') // Last day of every month at 11:59 PM
  async handleMonthlyAutomation() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (tomorrow.getDate() !== 1) {
      // Not the last day of the month
      return;
    }
    console.log('Running monthly automation...');
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const settings = await this.prisma.setting.findFirst();
    if (!settings?.auto_close_enabled && !settings?.auto_email_enabled) {
      console.log('Automation disabled. Skipping.');
      return;
    }

    try {
      // 1. Generate settlements
      if (settings?.auto_close_enabled) {
        console.log('Generating settlements...');
        await this.settlementsService.generate(month, year);
      }

      // 2. Generate invoices
      console.log('Generating invoices...');
      const invoices: any[] = await this.invoicesService.generateAll(month, year);

      // 3. Send emails
      if (settings?.auto_email_enabled) {
        console.log('Sending emails...');
        for (const invoice of invoices) {
          const member = await this.prisma.member.findUnique({
            where: { id: invoice.member_id },
          });
          if (member?.email) {
            try {
              await this.emailService.sendEmail({
                to: member.email,
                subject: `Monthly Invoice - ${month}/${year}`,
                body: `Dear ${member.name},\n\nYour monthly invoice for ${month}/${year} is ready. Please check your account for details.\n\nThank you,\nMess Management`,
                member_id: member.id,
              });

              await this.prisma.invoice.update({
                where: { id: invoice.id },
                data: { email_sent: true, sent_at: new Date() },
              });
            } catch (e) {
              console.error(`Failed to send email to ${member.email}:`, e);
            }
          }
        }
      }

      console.log('Monthly automation completed.');
    } catch (error) {
      console.error('Monthly automation failed:', error);
    }
  }

  // Also run on the first day of month at 12:01 AM as a fallback
  @Cron('1 0 1 * *')
  async handleFallbackAutomation() {
    const today = new Date();
    const month = today.getMonth(); // Previous month
    const year = today.getFullYear();
    const prevMonth = month === 0 ? 12 : month;
    const prevYear = month === 0 ? year - 1 : year;

    const settings = await this.prisma.setting.findFirst();
    if (!settings?.auto_close_enabled && !settings?.auto_email_enabled) return;

    // Check if settlements already exist for previous month
    const existing = await this.prisma.monthlySettlement.findFirst({
      where: { month: prevMonth, year: prevYear },
    });

    if (!existing) {
      await this.handleMonthlyAutomation();
    }
  }
}
