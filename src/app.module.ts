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
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
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
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from './logger/logger.module';
import * as redisStore from 'cache-manager-redis-store';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { join } from 'path';
import { FilesUploadResolver } from '@/files-upload/files-upload.resolver';
import { UploadScalar } from '@/commons/scalars/upload.scalar';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    RolesModule,
    PubSubModule,
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GraphqlOptions,
    }),

    MailerModule.forRootAsync({
      useClass: MailerConfigService,
      inject: [ConfigService],
    }),

    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   useFactory: async (configService: ConfigService) => ({
    //     store: redisStore as any,
    //     host: configService.get<string>('REDIS_HOST'),
    //     port: configService.get<number>('REDIS_PORT'),
    //     ttl: configService.get<number>('CACHE_TTL'),
    //   }),
    //   inject: [ConfigService],
    // }),

    CacheModule.register({
      isGlobal: true,
      ttl: 5,
      max: 10,
    }),
    FilesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MailerQueueService,
    MailProcessor,
    JwtService,
    DateScalar,
    FilesUploadResolver,
    UploadScalar,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(graphqlUploadExpress()).forRoutes('graphql');
  }
}
