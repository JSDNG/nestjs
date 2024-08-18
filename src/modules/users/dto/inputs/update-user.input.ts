import { IsMongoId, IsNotEmpty } from 'class-validator';
import { CreateUserInput } from './create-user.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field()
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @Field()
  @IsNotEmpty()
  username: string;

  //   @Field()
  //   @IsNotEmpty()
  //   email: string;
}
