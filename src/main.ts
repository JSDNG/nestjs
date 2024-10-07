import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { MyLogger } from '@/logger/my-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  //app.useLogger(app.get(MyLogger));

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  //app.setGlobalPrefix('api/v1', { exclude: [''] });

  app.useGlobalPipes(new ValidationPipe());

  //config cors
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();
