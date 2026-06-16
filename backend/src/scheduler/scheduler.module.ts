import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomationService } from './automation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SettlementsModule } from '../settlements/settlements.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, SettlementsModule, InvoicesModule, EmailModule],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class SchedulerModule {}
