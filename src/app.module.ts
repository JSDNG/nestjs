import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UsersModule } from '@/modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AuthModule } from '@/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerQueueService } from '@/mailer/mailer.service';
import { MailProcessor } from '@/mailer/mail.processor';
import { RolesModule } from '@/modules/roles/roles.module';
import { AuthGuard } from '@/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { GraphqlOptions, MailerConfigService } from './graphql.options';
import { DateScalar } from '@/commons/scalars/date.scalar';
import { PubSubModule } from './subscriptions/pubsub.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from './logger/logger.module';
import * as redisStore from 'cache-manager-redis-store';
import { MulterModule } from '@nestjs/platform-express';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { join } from 'path';
import { FilesUploadModule } from '@/files-upload/files-upload.module';
import { FilesUploadResolver } from '@/files-upload/files-upload.resolver';
import { UploadScalar } from '@/commons/scalars/upload.scalar';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    RolesModule,
    PubSubModule,
    LoggerModule,
    FilesUploadModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GraphqlOptions,
    }),

    MailerModule.forRootAsync({
      useClass: MailerConfigService,
      inject: [ConfigService],
    }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: redisStore as any,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        ttl: configService.get<number>('CACHE_TTL'),
      }),
      inject: [ConfigService],
    }),

    MulterModule.registerAsync({
      useFactory: () => ({
        dest: join(__dirname, '..', 'uploads'),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MailerQueueService,
    MailProcessor,
    JwtService,
    DateScalar,
    FilesUploadResolver,
    //UploadScalar,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(graphqlUploadExpress()).forRoutes('graphql');
  }
}
