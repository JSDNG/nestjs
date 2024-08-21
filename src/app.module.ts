import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UsersModule } from '@/modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
//import { AuthModule } from '@/auth/auth.module';
import { TransformInterceptor } from './core/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get<string>('DATABASE_URL'),
    //   }),
    //   inject: [ConfigService],
    // }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: 'src/schema.gql',
    }),
    UsersModule,
    //AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: TransformInterceptor,
    // },
  ],
})
export class AppModule {}
