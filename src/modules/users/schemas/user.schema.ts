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

export const ResultUnion = createUnionType({
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

