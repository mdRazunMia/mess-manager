import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(month?: number, year?: number, categoryId?: number) {
    const where: any = {};
    if (categoryId) where.category_id = categoryId;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      where.expense_date = {
        gte: startDate,
        lt: endDate,
      };
    }

    return this.prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { expense_date: 'desc' },
    });
  }

  getCategories() {
    return this.prisma.expenseCategory.findMany();
  }

  async getSummary(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const expenses = await this.prisma.expense.findMany({
      where: {
        expense_date: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: { category: true },
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory: Record<string, number> = {};
    for (const e of expenses) {
      const cat = e.category.name;
      byCategory[cat] = (byCategory[cat] || 0) + e.amount;
    }

    return {
      month,
      year,
      total,
      count: expenses.length,
      by_category: byCategory,
    };
  }

  create(data: any) {
    const createData: any = { ...data };
    if (data.mess_id !== undefined) createData.mess_id = Number(data.mess_id);
    if (data.category_id !== undefined) createData.category_id = Number(data.category_id);
    if (data.amount !== undefined) createData.amount = Number(data.amount);
    createData.expense_date = new Date(data.expense_date);
    return this.prisma.expense.create({
      data: createData,
      include: { category: true },
    });
  }

  update(id: number, data: any) {
    const updateData: any = { ...data };
    if (data.mess_id !== undefined) updateData.mess_id = Number(data.mess_id);
    if (data.category_id !== undefined) updateData.category_id = Number(data.category_id);
    if (data.amount !== undefined) updateData.amount = Number(data.amount);
    if (data.expense_date) updateData.expense_date = new Date(data.expense_date);
    return this.prisma.expense.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
  }

  remove(id: number) {
    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
