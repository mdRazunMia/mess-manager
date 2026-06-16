import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const totalMembers = await this.prisma.member.count({
      where: { status: 'active' },
    });

    const totalInactive = await this.prisma.member.count({
      where: { status: 'inactive' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMeals = await this.prisma.meal.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const todayBreakfast = todayMeals.filter(m => m.breakfast).length;
    const todayLunch = todayMeals.filter(m => m.lunch).length;
    const todayDinner = todayMeals.filter(m => m.dinner).length;

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 1);

    const monthlyExpenses = await this.prisma.expense.findMany({
      where: {
        expense_date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const monthlyPayments = await this.prisma.payment.findMany({
      where: {
        payment_date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const totalCollections = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

    // Pending dues = sum of all settlements total_due for current month
    const settlements = await this.prisma.monthlySettlement.findMany({
      where: {
        month: currentMonth,
        year: currentYear,
      },
    });

    const pendingDues = settlements.reduce((sum, s) => sum + s.total_due, 0);

    // Get current meal rate
    const currentSettlement = settlements[0];
    const currentMealRate = currentSettlement?.meal_rate || 0;

    const monthlyMeals = await this.prisma.meal.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const currentMonthMeals = monthlyMeals.reduce((sum, m) => {
      return sum + (m.breakfast ? 0.5 : 0) + (m.lunch ? 1 : 0) + (m.dinner ? 1 : 0);
    }, 0);

    return {
      total_members: totalMembers,
      total_inactive: totalInactive,
      today_breakfast: todayBreakfast,
      today_lunch: todayLunch,
      today_dinner: todayDinner,
      total_expenses: totalExpenses,
      total_collections: totalCollections,
      pending_dues: pendingDues,
      current_meal_rate: currentMealRate,
      current_month_meals: currentMonthMeals,
    };
  }

  async getStats(month?: number, year?: number) {
    const today = new Date();
    const targetMonth = month || today.getMonth() + 1;
    const targetYear = year || today.getFullYear();
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);

    // Monthly expenses trend (last 6 months)
    const expenseTrend: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(targetYear, targetMonth - 1 - i, 1);
      const s = new Date(d.getFullYear(), d.getMonth(), 1);
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const expenses = await this.prisma.expense.findMany({
        where: {
          expense_date: {
            gte: s,
            lt: e,
          },
        },
      });
      expenseTrend.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        total: expenses.reduce((sum, x) => sum + x.amount, 0),
      });
    }

    // Meal consumption trend
    const mealTrend: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(targetYear, targetMonth - 1 - i, 1);
      const s = new Date(d.getFullYear(), d.getMonth(), 1);
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const meals = await this.prisma.meal.findMany({
        where: {
          date: {
            gte: s,
            lt: e,
          },
        },
      });
      mealTrend.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        breakfast: meals.filter(m => m.breakfast).length,
        lunch: meals.filter(m => m.lunch).length,
        dinner: meals.filter(m => m.dinner).length,
      });
    }

    // Collection trend
    const collectionTrend: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(targetYear, targetMonth - 1 - i, 1);
      const s = new Date(d.getFullYear(), d.getMonth(), 1);
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const payments = await this.prisma.payment.findMany({
        where: {
          payment_date: {
            gte: s,
            lt: e,
          },
        },
      });
      collectionTrend.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        total: payments.reduce((sum, p) => sum + p.amount, 0),
      });
    }

    return {
      expense_trend: expenseTrend,
      meal_trend: mealTrend,
      collection_trend: collectionTrend,
    };
  }
}
