import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bullmq';

@Injectable()
export class MailerQueueService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(job: Job) {
    const { name, email, activationCode } = job.data;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Activate your account at @nestjs ✔',
        template: 'register.hbs',
        context: {
          name: name,
          activationCode,
        },
      });
    } catch (error) {
      console.error('Error sending mail:', error);
      throw new Error('Failed to send email');
    }
  }
}
