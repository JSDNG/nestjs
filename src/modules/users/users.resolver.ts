import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User, UserPagination } from './schemas/user.schema';
import { CreateUserInput, UserFilter } from './dto/inputs/create-user.input';
import { CreateUsersInput } from './dto/inputs/create-users.input';
import { UpdateUserInput } from './dto/inputs/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User, { name: 'createUser' })
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Mutation(() => [User], { name: 'createUsers' })
  async createUsers(
    @Args('createUsersInput') createUsersInput: CreateUsersInput,
  ): Promise<User[]> {
    return this.usersService.createUsers(createUsersInput);
  }

  @Query(() => UserPagination, { name: 'users' })
  async findAll(@Args('filter') filter: UserFilter): Promise<UserPagination> {
    // debugger;
    return await this.usersService.findAll(filter);
  }

  @Query(() => User, { name: 'user' })
  async findOne(@Args('id', { type: () => Number }) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update(updateUserInput);
  }

  @Mutation(() => String, { name: 'deleteUser' })
  async removeUser(
    @Args('id', { type: () => Number }) id: number,
  ): Promise<string> {
    return this.usersService.remove(id);
  }
}
