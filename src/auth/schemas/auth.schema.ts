import { User } from '@/modules/users/schemas/user.schema';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class LoginResult {
  @Field(() => User)
  data: User;

  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

}
