import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLError } from 'graphql';
import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GraphqlOptions implements GqlOptionsFactory<ApolloDriverConfig> {
  createGqlOptions(): ApolloDriverConfig {
    return {
      playground: true,
      autoSchemaFile: 'src/schema.gql',
      subscriptions: {
        'subscriptions-transport-ws': {
          path: '/graphql',
        },
      }, 
      formatError: (error: GraphQLError) => {
        const originalError = error.extensions?.originalError;

        const graphQLFormattedError = {
          message:
            (originalError as { message?: string })?.message || error.message,
          error:
            (originalError as { error?: string })?.error ||
            (originalError as { code?: string })?.code ||
            'SERVER_ERROR',
          statusCode:
            (originalError as { statusCode?: number })?.statusCode || 500,
        };

        return graphQLFormattedError;
      },
    };
  }
}

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMailerOptions(): MailerOptions {
    return {
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASS'),
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@localhost>',
      },
      template: {
        dir: process.cwd() + '/src/mailer/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }
}
