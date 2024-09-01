import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UsersService } from './users.service';
import {
  ResultUnion,
  User,
  UserConnection,
  UserPagination,
} from './schemas/user.schema';
import { CreateUserInput, UserFilter } from './dto/inputs/create-user.input';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { CurrentUser } from '@/auth/auth.decorator';
import { SkipAuthGuard } from '@/auth/skip-auth-guard.decorator';
import { Paginated } from '@/pagination/paginated.decorator';
import { IPaginatedType } from '@/pagination/paginated-type.interface';
import { Role } from '../roles/schemas/role.schema';
import { RolesService } from '../roles/roles.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  @Mutation(() => User, { name: 'createUser' })
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => UserPagination, { name: 'users' })
  async findAll(
    @CurrentUser() user: User,
    @Args('filter') filter: UserFilter,
  ): Promise<UserPagination> {
    //console.log(user);
    return await this.usersService.findAll(filter);
  }

  @Query(() => UserConnection, { name: 'getUsersPagination' })
  async getUsersPagination(
    @Args('offset', { type: () => Number, nullable: true }) offset?: number,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
  ): Promise<UserConnection> {
    return await this.usersService.getUsersPagination({ offset, limit });
  }

  // @Query(() => Paginated(User), { name: 'getUsersPagination' })
  // async getUsersPagination(
  //   @Args('filter') filter: UserFilter
  // ): Promise<IPaginatedType<User>> {
  //   return this.usersService.getUsersPagination(filter);
  // }

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

  //test dateScalars
  @Query(() => Date)
  getCurrentDate(): Date {
    return new Date();
  }

  @Mutation(() => String)
  createEvent(@Args('date', { type: () => Date }) date: Date): string {
    console.log('createEvent:', date); // Log giá trị nhận từ client
    return `Event created on ${date.toISOString()}`;
  }

  //test union
  @Query(() => [ResultUnion])
  async search(@Args('text') text: string): Promise<Array<typeof ResultUnion>> {
    const roles: Role[] = await this.rolesService.findAll();

    // Filter Role based on the keyword 'text'
    const filteredRoles = roles.filter((role) =>
      role.roleName.toLowerCase().includes(text.toLowerCase()),
    );

    // Return a combined list of User and Role (here it's just Role)
    return [...filteredRoles];
  }
}
