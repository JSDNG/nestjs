import { IsNotEmpty, MinLength } from 'class-validator';
import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
export class GetUserArgs {
  @Field()
  id: string;

  @Field()
  @IsNotEmpty()
  name: string;
  
  @Field()
  @IsNotEmpty()
  email: string;
}
