import { Field, Int, ObjectType } from '@nestjs/graphql';

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

  @Field()
  isActive: boolean;

  @Field()
  codeId: string;

  @Field()
  codeExpired: Date;

  @Field()
  refreshToken: string;
}

@ObjectType()
export class UserPagination {
  @Field(() => [User])
  users: User[];

  @Field()
  total: number;

  @Field()
  limit: number;

  @Field()
  page: number;
}
