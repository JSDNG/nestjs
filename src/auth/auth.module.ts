import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PrismaService } from '@/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailModule } from '@/mailer/mail.module';
import { AuthGuard } from './auth.guard';
import { UsersModule } from '@/modules/users/users.module';
import { FilesModule } from '@/files/files.module';

@Module({
  imports: [MailModule, UsersModule, FilesModule],
  providers: [AuthResolver, AuthService, PrismaService, JwtService, AuthGuard],
})
export class AuthModule {}
