import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) {}

  private async getTransporter() {
    const settings = await this.prisma.setting.findFirst();
    if (!settings || !settings.smtp_host || !settings.smtp_username) {
      throw new Error('SMTP settings not configured');
    }

    return nodemailer.createTransport({
      host: settings.smtp_host,
      port: settings.smtp_port || 587,
      secure: false,
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password,
      },
    });
  }

  async sendEmail(data: any) {
    const { to, subject, body, member_id } = data;
    const transporter = await this.getTransporter();
    const settings = await this.prisma.setting.findFirst();

    try {
      await transporter.sendMail({
        from: settings?.smtp_from || settings?.smtp_username,
        to,
        subject,
        text: body,
        html: `<pre style="font-family: sans-serif;">${body}</pre>`,
      });

      if (member_id) {
        await this.prisma.emailLog.create({
          data: {
            member_id: member_id,
            subject,
            status: 'sent',
            sent_at: new Date(),
          },
        });
      }

      return { success: true, message: 'Email sent successfully' };
    } catch (error: any) {
      if (member_id) {
        await this.prisma.emailLog.create({
          data: {
            member_id: member_id,
            subject,
            status: 'failed',
            error_message: error.message || 'Unknown error',
          },
        });
      }
      return { success: false, message: error.message || 'Failed to send email' };
    }
  }

  async sendBulkEmail(data: any) {
    const { member_ids, subject, body, template } = data;
    const members = await this.prisma.member.findMany({
      where: { id: { in: member_ids } },
    });

    const results: any[] = [];
    for (const member of members) {
      if (!member.email) continue;

      let emailBody = body;
      if (template === 'monthly_bill') {
        emailBody = this.getMonthlyBillTemplate(member);
      } else if (template === 'payment_reminder') {
        emailBody = this.getPaymentReminderTemplate(member);
      }

      const result = await this.sendEmail({
        to: member.email,
        subject,
        body: emailBody,
        member_id: member.id,
      });

      results.push({
        member_id: member.id,
        email: member.email,
        success: result.success,
      });
    }

    return { success: true, results };
  }

  async testSmtp() {
    try {
      const transporter = await this.getTransporter();
      await transporter.verify();
      return { success: true, message: 'SMTP connection verified' };
    } catch (error: any) {
      return { success: false, message: error.message || 'SMTP connection failed' };
    }
  }

  private getMonthlyBillTemplate(member: any): string {
    return `Dear ${member.name},\n\nYour monthly mess bill has been generated. Please check the invoice for details.\n\nThank you,\nMess Management`;
  }

  private getPaymentReminderTemplate(member: any): string {
    return `Dear ${member.name},\n\nThis is a friendly reminder to settle your mess dues. Please make the payment at your earliest convenience.\n\nThank you,\nMess Management`;
  }
}
