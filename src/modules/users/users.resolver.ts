import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { ResultUnion, User } from './schemas/user.schema';
import { CreateUserInput } from './dto/inputs/create-user.input';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { CurrentUser } from '@/auth/auth.decorator';
import { SkipAuthGuard } from '@/auth/skip-auth-guard.decorator';
import { IPaginatedType, Paginated } from '@/pagination/paginated.decorator';
import { Role } from '../roles/schemas/role.schema';
import { RolesService } from '../roles/roles.service';
import { Filter } from '@/pagination/filter.input';
import { MyLogger } from '@/logger/my-logger.service';

const PaginatedUsers = Paginated(User);

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly logger: MyLogger,
  ) {}

  @Mutation(() => User, { name: 'createUser' })
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => PaginatedUsers, { name: 'getUsersPagination' })
  async getUsersPagination(
    @Args('filter') filter: Filter,
  ): Promise<IPaginatedType<User>> {
    return await this.usersService.getUsersPagination(filter);
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
    const users: User[] = await this.usersService.findAll();

    const filteredUsers = users.filter((role) =>
      role.username.toLowerCase().includes(text.toLowerCase()),
    );
    // Filter Role based on the keyword 'text'
    const filteredRoles = roles.filter((role) =>
      role.roleName.toLowerCase().includes(text.toLowerCase()),
    );

    // Return a combined list of User and Role (here it's just Role)
    return [...filteredUsers, ...filteredRoles];
  }

  //test logger
  @Query(() => String)
  getSomething() {
    this.logger.log('Accessed /some endpoint');
    // Do something
    return 'response';
  }
}
