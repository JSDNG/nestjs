import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesResolver } from './roles.resolver';
import { PrismaService } from '@/prisma.service';
import { PubSubModule } from '@/subscriptions/pubsub.module';

@Module({
  imports: [PubSubModule],
  providers: [RolesResolver, RolesService, PrismaService],
  exports: [RolesService],
})
export class RolesModule {}
