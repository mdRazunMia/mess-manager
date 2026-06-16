import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MessModule } from './mess/mess.module';
import { MembersModule } from './members/members.module';
import { MealsModule } from './meals/meals.module';
import { ExpensesModule } from './expenses/expenses.module';
import { PaymentsModule } from './payments/payments.module';
import { SettlementsModule } from './settlements/settlements.module';
import { InvoicesModule } from './invoices/invoices.module';
import { EmailModule } from './email/email.module';
import { SettingsModule } from './settings/settings.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MessModule,
    MembersModule,
    MealsModule,
    ExpensesModule,
    PaymentsModule,
    SettlementsModule,
    InvoicesModule,
    EmailModule,
    SettingsModule,
    DashboardModule,
    SchedulerModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
