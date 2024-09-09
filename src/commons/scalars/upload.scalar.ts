import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { Scalar, CustomScalar } from '@nestjs/graphql';

@Scalar('Uploads', () => GraphQLUpload)
export class UploadScalar implements CustomScalar<any, any> {
  description = 'Upload custom scalar type';

  parseValue(value: any): any {
    return value; // value from the client
  }

  serialize(value: any): any {
    return value; // value sent to the client
  }

  parseLiteral(ast: any): any {
    return ast.value; // value from the client
  }
}
