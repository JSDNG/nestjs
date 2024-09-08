import { Scalar, CustomScalar } from '@nestjs/graphql';
import { ValueNode } from 'graphql';

@Scalar('Upload')
export class UploadScalar implements CustomScalar<any, any> {
  description = 'Upload custom scalar type';

  parseValue(value: any) {
    return value;
  }

  serialize(value: any) {
    return value;
  }

  parseLiteral(ast: ValueNode) {
    return null;
  }
}
