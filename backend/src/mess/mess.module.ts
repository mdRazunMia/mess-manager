import { Module } from '@nestjs/common';
import { MessController } from './mess.controller';
import { MessService } from './mess.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MessController],
  providers: [MessService],
  exports: [MessService],
})
export class MessModule {}
