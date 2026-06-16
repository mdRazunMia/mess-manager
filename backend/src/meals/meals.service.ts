import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.meal.findMany({
      include: { member: true },
      orderBy: { date: 'desc' },
    });
  }

  async findByDate(dateStr: string) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const meals = await this.prisma.meal.findMany({
      where: {
        date: {
          gte: date,
          lt: nextDate,
        },
      },
      include: { member: true },
    });

    // Ensure all active members have a meal record for this date
    const activeMembers = await this.prisma.member.findMany({
      where: { status: 'active' },
    });

    const existingMemberIds = new Set(meals.map(m => m.member_id));
    const missingMembers = activeMembers.filter(m => !existingMemberIds.has(m.id));

    for (const member of missingMembers) {
      const meal = await this.prisma.meal.create({
        data: {
          member_id: member.id,
          date: date,
          breakfast: false,
          lunch: false,
          dinner: false,
        },
        include: { member: true },
      });
      meals.push(meal);
    }

    return meals.sort((a, b) => a.member.name.localeCompare(b.member.name));
  }

  async findByMemberMonth(memberId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    return this.prisma.meal.findMany({
      where: {
        member_id: memberId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getMonthlyReport(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const meals = await this.prisma.meal.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: { member: true },
    });

    const settings = await this.prisma.setting.findFirst();
    const bWeight = settings?.breakfast_weight ?? 0.5;
    const lWeight = settings?.lunch_weight ?? 1.0;
    const dWeight = settings?.dinner_weight ?? 1.0;

    const memberStats: Record<number, any> = {};
    let totalBreakfast = 0;
    let totalLunch = 0;
    let totalDinner = 0;
    let totalWeightedMeals = 0;

    for (const meal of meals) {
      if (!memberStats[meal.member_id]) {
        memberStats[meal.member_id] = {
          member_id: meal.member_id,
          name: meal.member.name,
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          weighted_meals: 0,
        };
      }

      if (meal.breakfast) {
        memberStats[meal.member_id].breakfast += 1;
        totalBreakfast += 1;
      }
      if (meal.lunch) {
        memberStats[meal.member_id].lunch += 1;
        totalLunch += 1;
      }
      if (meal.dinner) {
        memberStats[meal.member_id].dinner += 1;
        totalDinner += 1;
      }
    }

    for (const key in memberStats) {
      const stats = memberStats[key];
      stats.weighted_meals =
        stats.breakfast * bWeight +
        stats.lunch * lWeight +
        stats.dinner * dWeight;
      totalWeightedMeals += stats.weighted_meals;
    }

    return {
      month,
      year,
      total_breakfast: totalBreakfast,
      total_lunch: totalLunch,
      total_dinner: totalDinner,
      total_weighted_meals: totalWeightedMeals,
      member_stats: Object.values(memberStats),
    };
  }

  create(data: any) {
    const createData: any = { ...data };
    if (data.member_id !== undefined) createData.member_id = Number(data.member_id);
    if (data.date) createData.date = new Date(data.date);
    return this.prisma.meal.create({
      data: createData,
      include: { member: true },
    });
  }

  update(id: number, data: any) {
    const updateData: any = { ...data };
    if (data.member_id !== undefined) updateData.member_id = Number(data.member_id);
    if (data.date) updateData.date = new Date(data.date);
    return this.prisma.meal.update({
      where: { id },
      data: updateData,
      include: { member: true },
    });
  }

  async createBulk(data: any[]) {
    const results: any[] = [];
    for (const item of data) {
      const member_id = Number(item.member_id);
      const date = item.date;
      const breakfast = item.breakfast;
      const lunch = item.lunch;
      const dinner = item.dinner;
      const mealDate = new Date(date);
      mealDate.setHours(0, 0, 0, 0);

      const existing = await this.prisma.meal.findFirst({
        where: {
          member_id,
          date: {
            gte: mealDate,
            lt: new Date(mealDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      if (existing) {
        const updated = await this.prisma.meal.update({
          where: { id: existing.id },
          data: {
            breakfast: breakfast ?? existing.breakfast,
            lunch: lunch ?? existing.lunch,
            dinner: dinner ?? existing.dinner,
          },
          include: { member: true },
        });
        results.push(updated);
      } else {
        const created = await this.prisma.meal.create({
          data: {
            member_id,
            date: mealDate,
            breakfast: breakfast ?? false,
            lunch: lunch ?? false,
            dinner: dinner ?? false,
          },
          include: { member: true },
        });
        results.push(created);
      }
    }
    return results;
  }
}
