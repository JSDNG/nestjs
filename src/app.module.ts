import { Module, ValidationPipe } from '@nestjs/common';
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

@Module({
  imports: [
    UsersModule,
    AuthModule,
    RolesModule,
    PubSubModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GraphqlOptions,
    }),

    MailerModule.forRootAsync({
      useClass: MailerConfigService,
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MailerQueueService,
    MailProcessor,
    JwtService,
    DateScalar,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
