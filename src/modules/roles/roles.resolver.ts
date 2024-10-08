import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Subscription,
} from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { Role } from './schemas/role.schema';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { SkipAuthGuard } from '@/auth/skip-auth-guard.decorator';
import { Inject, UseInterceptors } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RabbitmqService } from '@/rabbitmq/rabbitmq.service';

@Resolver(() => Role)
export class RolesResolver {
  constructor(
    private readonly rolesService: RolesService,
    @Inject('PUB_SUB') private pubSub: PubSub,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly rabbitMQService: RabbitmqService, // Inject RabbitMQ service
  ) {}

  @Mutation(() => Role, { name: 'createRole' })
  createRole(@Args('createRoleInput') createRoleInput: CreateRoleInput) {
    return this.rolesService.create(createRoleInput);
  }

  @Query(() => [Role], { name: 'roles' })
  @CacheKey('rolesList')
  //@CacheTTL(60)
  @UseInterceptors(CacheInterceptor)
  async findAll() {
    const roles = await this.rolesService.findAll();
    await this.cacheManager.set('rolesList', roles, 0);
    // await this.cacheManager.set('key', 'value', 20);
    const cachedData = await this.cacheManager.get('rolesList');
    console.log('Cached Data:', cachedData);
    return roles;
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

  //caching
  @Query(() => String, { name: 'cachedData' })
  async cachedData(): Promise<string> {
    try {
      // const cachedData = await this.cacheManager.get('key');
      const cachedData = await this.cacheManager.get('rolesList');
      console.log('Cached Data:', cachedData);
      if (cachedData === undefined) {
        return 'No data in cache';
      }
      return JSON.stringify(cachedData); // Chuyển đổi mảng thành chuỗi để trả về
    } catch (error) {
      console.error('Error fetching from cache:', error);
      return 'Error fetching data';
    }
  }

  // RabbitMQ
  @Mutation(() => Role)
  async createTask(@Args('createRoleInput') createRoleInput: CreateRoleInput) {
    const { role } = await this.rolesService.createTask(createRoleInput);
    return role;
  }

  @Mutation(() => Role)
  async processTask(@Args('id', { type: () => Number }) id: number): Promise<Role> {
    return this.rolesService.processTask(id);
  }

  // Mutation to publish a message to RabbitMQ
  @Mutation(() => String, { name: 'publishLog' })
  async publishLog(
    @Args('level') level: string,
    @Args('message') message: string,
  ): Promise<string> {
    await this.rabbitMQService.publishMessage(level, message);
    return `Message sent to ${level} logs: ${message}`;
  }

  // Mutation to consume info logs
  @Mutation(() => String, { name: 'consumeInfoLogs' })
  async consumeInfoLogs(): Promise<string> {
    await this.rabbitMQService.consumeInfoLogs((message) => {
      console.log('Received info log:', message);
    });
    return 'Started consuming info logs';
  }

  // Mutation to consume error logs
  @Mutation(() => String, { name: 'consumeErrorLogs' })
  async consumeErrorLogs(): Promise<string> {
    await this.rabbitMQService.consumeErrorLogs((message) => {
      console.log('Received error log:', message);
    });
    return 'Started consuming error logs';
  }
}
