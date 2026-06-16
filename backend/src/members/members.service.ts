import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.member.findMany({
      where,
      include: {
        payments: {
          orderBy: { payment_date: 'desc' },
          take: 5,
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.member.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { payment_date: 'desc' },
        },
        meals: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });
  }

  create(data: any) {
    const createData: any = { ...data };
    if (data.mess_id !== undefined) {
      createData.mess_id = Number(data.mess_id);
    } else {
      createData.mess_id = 1;
    }
    if (data.rent !== undefined) createData.rent = Number(data.rent);
    if (data.join_date) createData.join_date = new Date(data.join_date);
    return this.prisma.member.create({ data: createData });
  }

  update(id: number, data: any) {
    const updateData: any = { ...data };
    if (data.mess_id !== undefined) updateData.mess_id = Number(data.mess_id);
    if (data.rent !== undefined) updateData.rent = Number(data.rent);
    if (data.join_date) updateData.join_date = new Date(data.join_date);
    return this.prisma.member.update({
      where: { id },
      data: updateData,
    });
  }

  remove(id: number) {
    return this.prisma.member.delete({
      where: { id },
    });
  }

  async toggleStatus(id: number) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new Error('Member not found');
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    return this.prisma.member.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  getPayments(id: number) {
    return this.prisma.payment.findMany({
      where: { member_id: id },
      orderBy: { payment_date: 'desc' },
    });
  }

  async getStatement(memberId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });
    if (!member) throw new Error('Member not found');

    const settings = await this.prisma.setting.findFirst();
    const bWeight = settings?.breakfast_weight ?? 0.5;
    const lWeight = settings?.lunch_weight ?? 1.0;
    const dWeight = settings?.dinner_weight ?? 1.0;

    // Meals
    const meals = await this.prisma.meal.findMany({
      where: {
        member_id: memberId,
        date: { gte: startDate, lt: endDate },
      },
    });

    let totalBreakfast = 0;
    let totalLunch = 0;
    let totalDinner = 0;
    let weightedMeals = 0;

    for (const meal of meals) {
      if (meal.breakfast) {
        totalBreakfast += 1;
        weightedMeals += bWeight;
      }
      if (meal.lunch) {
        totalLunch += 1;
        weightedMeals += lWeight;
      }
      if (meal.dinner) {
        totalDinner += 1;
        weightedMeals += dWeight;
      }
    }

    // Payments
    const payments = await this.prisma.payment.findMany({
      where: {
        member_id: memberId,
        payment_date: { gte: startDate, lt: endDate },
      },
    });
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

    // Expenses (shopping / market)
    const marketCategory = await this.prisma.expenseCategory.findUnique({
      where: { name: 'Market' },
    });
    const foodExpenses = await this.prisma.expense.findMany({
      where: {
        expense_date: { gte: startDate, lt: endDate },
        category_id: marketCategory?.id,
      },
      include: { category: true },
    });
    const totalFoodCost = foodExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Utility expenses
    const utilityNames = ['Gas', 'Electricity', 'Internet', 'Water', 'Cleaner'];
    const utilityCategories = await this.prisma.expenseCategory.findMany({
      where: { name: { in: utilityNames } },
    });
    const utilityExpenses = await this.prisma.expense.findMany({
      where: {
        expense_date: { gte: startDate, lt: endDate },
        category_id: { in: utilityCategories.map(c => c.id) },
      },
      include: { category: true },
    });
    const totalUtilityCost = utilityExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Other expenses
    const otherExpenses = await this.prisma.expense.findMany({
      where: {
        expense_date: { gte: startDate, lt: endDate },
        category_id: {
          notIn: [
            ...(marketCategory ? [marketCategory.id] : []),
            ...utilityCategories.map(c => c.id),
          ],
        },
      },
      include: { category: true },
    });

    // Calculate share
    const activeMembers = await this.prisma.member.count({
      where: { status: 'active' },
    });
    const utilityShare = activeMembers > 0 ? totalUtilityCost / activeMembers : 0;
    const mealRate = weightedMeals > 0 ? totalFoodCost / weightedMeals : 0;
    const mealCost = weightedMeals * mealRate;
    const rent = member.rent || 0;
    const totalDue = mealCost + rent + utilityShare - totalPayments;

    return {
      member,
      month,
      year,
      meals: {
        breakfast: totalBreakfast,
        lunch: totalLunch,
        dinner: totalDinner,
        weighted: Number(weightedMeals.toFixed(2)),
      },
      meal_rate: Number(mealRate.toFixed(2)),
      meal_cost: Number(mealCost.toFixed(2)),
      rent: Number(rent.toFixed(2)),
      utility_share: Number(utilityShare.toFixed(2)),
      total_expenses: {
        food: Number(totalFoodCost.toFixed(2)),
        utility: Number(totalUtilityCost.toFixed(2)),
        other: Number(otherExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2)),
      },
      payments: {
        total: Number(totalPayments.toFixed(2)),
        list: payments,
      },
      total_due: Number(totalDue.toFixed(2)),
      status: totalDue > 0 ? 'give_taka' : totalDue < 0 ? 'back_taka' : 'settled',
      status_label: totalDue > 0 ? 'Give Taka' : totalDue < 0 ? 'Back Taka' : 'Settled',
    };
  }
}
