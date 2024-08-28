import { AuthService } from '@/auth/auth.service';
import { PrismaService } from '@/prisma.service';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    BullModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          connection: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        }),
        inject: [ConfigService],
      }),
      BullModule.registerQueue({
        name: 'mailQueue',
      }),
  ],
  providers: [AuthService, PrismaService, JwtService],
  exports: [BullModule], // Export BullModule nếu cần
})
export class MailModule {}
