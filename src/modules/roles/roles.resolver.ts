import { Resolver, Query, Mutation, Args, Int, Subscription } from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { Role } from './schemas/role.schema';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { SkipAuthGuard } from '@/auth/skip-auth-guard.decorator';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => Role)
export class RolesResolver {
  constructor(
    private readonly rolesService: RolesService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  @Mutation(() => Role, { name: 'createRole' })
  createRole(@Args('createRoleInput') createRoleInput: CreateRoleInput) {
    return this.rolesService.create(createRoleInput);
  }

  @Query(() => [Role], { name: 'roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Query(() => Role, { name: 'role' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.rolesService.findOne(id);
  }

  @Mutation(() => Role)
  updateRole(@Args('updateRoleInput') updateRoleInput: UpdateRoleInput) {
    return this.rolesService.update(updateRoleInput.id, updateRoleInput);
  }

  @Mutation(() => String, { name: 'deleteUser' })
  async removeUser(
    @Args('id', { type: () => Number }) id: number,
  ): Promise<string> {
    return this.rolesService.remove(id);
  }

  //test Subscription
  @Subscription(() => Role, {
    name: 'roleAdded',
  })
  roleAdded() {
    return this.pubSub.asyncIterator('roleAdded');
  }

  @Mutation(() => Role)
  async testcreateRole(@Args('name') name: CreateRoleInput) {
    const newRole = await this.rolesService.create(name);
    this.pubSub.publish('roleAdded', { roleAdded: newRole });
    return newRole;
  }
}
