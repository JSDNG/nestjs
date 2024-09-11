import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { MyLogger } from '@/logger/my-logger.service';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  //app.useLogger(app.get(MyLogger));
  //app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  //app.setGlobalPrefix('api/v1', { exclude: [''] });

  app.useGlobalPipes(new ValidationPipe());

  //config cors
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();
