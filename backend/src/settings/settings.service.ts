import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async find() {
    const settings = await this.prisma.setting.findFirst();
    if (!settings) {
      const mess = await this.prisma.mess.findFirst();
      const messId = mess?.id || 1;
      return this.prisma.setting.create({
        data: {
          mess_id: messId,
          breakfast_weight: 0.5,
          lunch_weight: 1.0,
          dinner_weight: 1.0,
          auto_email_enabled: false,
          auto_close_enabled: false,
          smtp_host: '',
          smtp_port: 587,
          smtp_username: '',
          smtp_password: '',
          smtp_from: '',
          currency: 'BDT',
          language: 'en',
        },
      });
    }
    return settings;
  }

  async update(data: any) {
    const settings = await this.find();
    return this.prisma.setting.update({
      where: { id: settings.id },
      data,
    });
  }
}
