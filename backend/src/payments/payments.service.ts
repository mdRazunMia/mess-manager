import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(memberId?: number, month?: number, year?: number) {
    const where: any = {};
    if (memberId) where.member_id = memberId;
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      where.payment_date = {
        gte: startDate,
        lt: endDate,
      };
    }

    return this.prisma.payment.findMany({
      where,
      include: { member: true },
      orderBy: { payment_date: 'desc' },
    });
  }

  create(data: any) {
    return this.prisma.payment.create({
      data: {
        ...data,
        payment_date: new Date(data.payment_date),
      },
      include: { member: true },
    });
  }

  update(id: number, data: any) {
    const updateData: any = { ...data };
    if (data.payment_date) updateData.payment_date = new Date(data.payment_date);
    return this.prisma.payment.update({
      where: { id },
      data: updateData,
      include: { member: true },
    });
  }

  remove(id: number) {
    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
