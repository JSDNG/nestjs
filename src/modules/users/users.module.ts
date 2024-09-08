import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PrismaService } from '@/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RolesModule } from '../roles/roles.module';
import { LoggerModule } from '@/logger/logger.module';

@Module({
  imports: [RolesModule, LoggerModule],
  providers: [UsersResolver, UsersService, PrismaService, JwtService],
  exports: [UsersService],
})
export class UsersModule {}
