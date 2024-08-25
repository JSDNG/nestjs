import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PrismaService } from '@/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailModule } from '@/mailer/mail.module';

@Module({
  imports: [MailModule],
  providers: [AuthResolver, AuthService, PrismaService, JwtService],
})
export class AuthModule {}
