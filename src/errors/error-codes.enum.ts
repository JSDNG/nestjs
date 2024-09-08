import { ErrorCodes, ErrorMessages } from '@/enums/enum';
import { HttpException } from '@nestjs/common';

export class CustomNotFoundException extends HttpException {
  constructor(message: string = ErrorMessages.NotFound) {
    super(
      {
        statusCode: ErrorCodes.NotFound,
        message,
      },
      ErrorCodes.NotFound,
    );
  }
}
