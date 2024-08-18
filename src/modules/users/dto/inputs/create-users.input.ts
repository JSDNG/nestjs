import { InputType, Int, Field } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';

@InputType()
export class CreateUsersInput {
  @Field(() => [CreateUserInput])
  users: CreateUserInput[];
}
