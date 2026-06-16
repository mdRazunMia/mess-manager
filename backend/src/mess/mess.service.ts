import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.mess.findMany({
      include: { settings: true },
    });
  }

  findOne(id: number) {
    return this.prisma.mess.findUnique({
      where: { id },
      include: { settings: true },
    });
  }

  create(data: any) {
    return this.prisma.mess.create({
      data,
      include: { settings: true },
    });
  }

  update(id: number, data: any) {
    return this.prisma.mess.update({
      where: { id },
      data,
      include: { settings: true },
    });
  }

  remove(id: number) {
    return this.prisma.mess.delete({
      where: { id },
    });
  }
}
