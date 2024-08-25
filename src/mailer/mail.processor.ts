import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerQueueService } from './mailer.service';

@Processor('mailQueue')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailerQueueService: MailerQueueService) {
    super();
  }

  // Use WorkerHost to manage worker
  async process(job: Job) {
    await this.mailerQueueService.sendMail(job);
  }
}
