import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  sendEmail(@Body() data: any) {
    return this.emailService.sendEmail(data);
  }

  @Post('send-bulk')
  sendBulkEmail(@Body() data: any) {
    return this.emailService.sendBulkEmail(data);
  }

  @Post('test-smtp')
  testSmtp() {
    return this.emailService.testSmtp();
  }
}
