import * as winston from 'winston';
import { Injectable, LoggerService } from '@nestjs/common';
import { LogLevel, LogLevelColors } from '@/enums/enum';

@Injectable()
export class MyLogger implements LoggerService {
  private readonly logger = winston.createLogger({
    levels: {
      [LogLevel.Fatal]: 0,
      [LogLevel.Error]: 1,
      [LogLevel.Warn]: 2,
      [LogLevel.Info]: 3,
      [LogLevel.Debug]: 4,
      [LogLevel.Verbose]: 5,
    },
    format: winston.format.combine(
      winston.format.colorize({ all: true, colors: LogLevelColors }),
      winston.format.simple()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });

  log(message: any, ...optionalParams: any[]) {
    this.logger.log(LogLevel.Info, message, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.logger.log(LogLevel.Fatal, message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.log(LogLevel.Error, message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.log(LogLevel.Warn, message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.log(LogLevel.Debug, message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger.log(LogLevel.Verbose, message, ...optionalParams);
  }
}
