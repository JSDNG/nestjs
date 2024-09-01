import { Role } from '@/modules/roles/schemas/role.schema';
import { createUnionType, Field, Int, ObjectType } from '@nestjs/graphql';

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

  @Field()
  roleId: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Role)
  role?: Role; // Định nghĩa mối quan hệ với Role
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

@ObjectType()
export class UserEdge {
  @Field(() => User)
  node: User;

  @Field()
  cursor: number;
}

@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field({ nullable: true })
  startCursor?: number;

  @Field({ nullable: true })
  endCursor?: number;
}

@ObjectType()
export class UserConnection {
  @Field(() => [UserEdge])
  edges: UserEdge[];

  @Field()
  totalCount: number;

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [User, Role] as const,
  resolveType(value) {
    if ('username' in value) {
      return 'User';
    }
    if ('roleName' in value) {
      return 'Role';
    }
    return null;
  },
});

export { ResultUnion };
