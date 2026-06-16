import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettlementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(month: number, year: number) {
    return this.prisma.monthlySettlement.findMany({
      where: { month, year },
      include: { member: true },
    });
  }

  async findOne(memberId: number, month: number, year: number) {
    return this.prisma.monthlySettlement.findUnique({
      where: {
        member_id_month_year: {
          member_id: memberId,
          month,
          year,
        },
      },
      include: { member: true },
    });
  }

  async generate(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Get settings
    const settings = await this.prisma.setting.findFirst();
    const bWeight = settings?.breakfast_weight ?? 0.5;
    const lWeight = settings?.lunch_weight ?? 1.0;
    const dWeight = settings?.dinner_weight ?? 1.0;

    // Get active members
    const members = await this.prisma.member.findMany({
      where: { status: 'active' },
    });

    // Get all meals for the month
    const meals = await this.prisma.meal.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
        member_id: { in: members.map(m => m.id) },
      },
    });

    // Calculate total weighted meals
    let totalWeightedMeals = 0;
    const memberMealCounts: Record<number, number> = {};

    for (const meal of meals) {
      const weighted =
        (meal.breakfast ? bWeight : 0) +
        (meal.lunch ? lWeight : 0) +
        (meal.dinner ? dWeight : 0);
      totalWeightedMeals += weighted;
      memberMealCounts[meal.member_id] = (memberMealCounts[meal.member_id] || 0) + weighted;
    }

    // Get food expenses (Market category is food-related)
    const marketCategory = await this.prisma.expenseCategory.findUnique({
      where: { name: 'Market' },
    });

    const foodExpenses = await this.prisma.expense.findMany({
      where: {
        expense_date: { gte: startDate, lt: endDate },
        category_id: marketCategory?.id,
      },
    });

    const foodCost = foodExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Get utility expenses (Gas, Electricity, Internet, Water, Cleaner)
    const utilityCategoryNames = ['Gas', 'Electricity', 'Internet', 'Water', 'Cleaner'];
    const utilityCategories = await this.prisma.expenseCategory.findMany({
      where: { name: { in: utilityCategoryNames } },
    });

    const utilityExpenses = await this.prisma.expense.findMany({
      where: {
        expense_date: { gte: startDate, lt: endDate },
        category_id: { in: utilityCategories.map(c => c.id) },
      },
    });

    const totalUtilityCost = utilityExpenses.reduce((sum, e) => sum + e.amount, 0);
    const activeMemberCount = members.length;
    const utilityShare = activeMemberCount > 0 ? totalUtilityCost / activeMemberCount : 0;

    // Calculate meal rate
    const mealRate = totalWeightedMeals > 0 ? foodCost / totalWeightedMeals : 0;

    // Generate/settle each member
    const results: any[] = [];
    for (const member of members) {
      const mealCount = memberMealCounts[member.id] || 0;
      const mealCost = mealCount * mealRate;

      // Get member payments for the month
      const payments = await this.prisma.payment.findMany({
        where: {
          member_id: member.id,
          payment_date: { gte: startDate, lt: endDate },
        },
      });

      const paymentTotal = payments.reduce((sum, p) => sum + p.amount, 0);

      const totalDue = mealCost + utilityShare - paymentTotal;

      const settlement = await this.prisma.monthlySettlement.upsert({
        where: {
          member_id_month_year: {
            member_id: member.id,
            month,
            year,
          },
        },
        update: {
          meal_count: mealCount,
          meal_rate: mealRate,
          meal_cost: mealCost,
          utility_share: utilityShare,
          payment_total: paymentTotal,
          total_due: totalDue,
        },
        create: {
          member_id: member.id,
          month,
          year,
          meal_count: mealCount,
          meal_rate: mealRate,
          meal_cost: mealCost,
          utility_share: utilityShare,
          payment_total: paymentTotal,
          total_due: totalDue,
        },
        include: { member: true },
      });

      results.push(settlement);
    }

    return {
      month,
      year,
      food_cost: foodCost,
      total_weighted_meals: totalWeightedMeals,
      meal_rate: mealRate,
      total_utility: totalUtilityCost,
      utility_share: utilityShare,
      settlements: results,
    };
  }
}
