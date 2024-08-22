import { Field, Int, ObjectType } from '@nestjs/graphql';
import { v4 as uuid } from 'uuid';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  refreshToken: string;
}

@ObjectType()
export class UserPagination {
  @Field(() => [User])
  data: User[];

  @Field()
  total: number;

  @Field()
  limit: number;

  @Field()
  page: number;
}
