import { IsNotEmpty, MinLength } from 'class-validator';
import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
export class GetUserArgs {
  @Field()
  id: string;

  @Field()
  @IsNotEmpty()
  username: string;
  
  @Field()
  @IsNotEmpty()
  email: string;
}
