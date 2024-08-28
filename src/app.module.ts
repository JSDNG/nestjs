import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UsersModule } from '@/modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from '@/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerQueueService } from '@/mailer/mailer.service';
import { MailProcessor } from '@/mailer/mail.processor';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: 'src/schema.gql',
      formatError: (error: GraphQLError) => {
        const originalError = error.extensions?.originalError;

        const graphQLFormattedError = {
          message:
            (originalError as { message?: string })?.message || error.message,
          code: (originalError as { code?: string })?.code || 'SERVER_ERROR',
          statusCode:
            (originalError as { statusCode?: number })?.statusCode || 500,
        };

        return graphQLFormattedError;
      },
    }),
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          //ignoreTLS: true,
          secure: false,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        //preview: true,
        template: {
          dir: process.cwd() + '/src/mailer/templates/',
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MailerQueueService,
    MailProcessor,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
