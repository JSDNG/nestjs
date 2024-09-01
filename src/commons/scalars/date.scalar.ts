import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = 'Date custom scalar type';

  parseValue(value: string): Date {
    return new Date(value); // Chuyển từ chuỗi sang Date
  }

  serialize(value: Date): string {
    //return value.toISOString(); // Chuyển từ Date sang chuỗi ISO 8601
    return value.toISOString().split('T')[0]; // Trả về chuỗi chỉ có ngày (YYYY-MM-DD)
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value); // Chuyển từ chuỗi literal sang Date
    }
    return null;
  }
}
