import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesResolver } from './roles.resolver';
import { PrismaService } from '@/prisma.service';
import { PubSubModule } from '@/subscriptions/pubsub.module';
import { RabbitmqModule } from '@/rabbitmq/rabbitmq.module';

@Module({
  imports: [PubSubModule, RabbitmqModule],
  providers: [RolesResolver, RolesService, PrismaService],
  exports: [RolesService],
})
export class RolesModule {}
