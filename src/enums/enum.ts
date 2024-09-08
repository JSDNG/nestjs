import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

registerEnumType(Role, {
  name: 'Role',
});

export enum ErrorCodes {
  NotFound = 404,
  Unauthorized = 401,
  Forbidden = 403,
}

export enum ErrorMessages {
  NotFound = 'Not found.',
  Unauthorized = 'You are not authorized to access this resource.',
}

// log-levels.enum.ts
export enum LogLevel {
  Fatal = 'fatal',
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Verbose = 'verbose',
}

export const LogLevelColors = {
  fatal: 'red',
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  verbose: 'gray',
};
