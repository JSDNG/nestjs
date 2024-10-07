import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { PrismaService } from '@/prisma.service';
import { Role } from '@prisma/client';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { RabbitmqService } from '@/rabbitmq/rabbitmq.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RolesService {
  private readonly TASK_QUEUE = 'task_queue';

  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private rabbitMQService: RabbitmqService,
  ) {}

  async create(createRoleInput: CreateRoleInput): Promise<Role> {
    return await this.prismaService.role.create({ data: createRoleInput });
  }
  async findAll() {
    return await this.prismaService.role.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleInput: UpdateRoleInput) {
    return `This action updates a #${id} role`;
  }

  async remove(id: number): Promise<string> {
    const role = await this.prismaService.role.findFirst({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException('Role not found!');
    }
    try {
      await this.prismaService.role.delete({ where: { id } });
      return `Role with ID ${id} has been successfully deleted.`;
    } catch (error) {
      console.log(error);
      return 'Error form server';
    }
  }

  async getCachedData(): Promise<string> {
    const key = 'rolesList';
    try {
      const cachedData = await this.cacheManager.get<string>(key);
      if (cachedData) {
        console.log(cachedData);
      } else {
        throw new Error(`No data found for key: ${key}`);
      }

      return 'cachedData';
    } catch (error) {
      console.error('Error retrieving cached data:', error);
      throw new Error('Error retrieving cached data');
    }
  }

  async createTask(
    createRoleInput: CreateRoleInput,
  ): Promise<{ role: Role; correlationId: string }> {
    const correlationId = uuidv4();

    // Lưu dữ liệu vào cơ sở dữ liệu sử dụng Prisma
    const createdRole = await this.prismaService.role.create({
      data: createRoleInput,
    });

    // Gửi tin nhắn đến RabbitMQ
    await this.rabbitMQService.sendMessage(
      this.TASK_QUEUE,
      JSON.stringify({
        ...createRoleInput,
        id: createdRole.id,
        correlationId,
      }),
    );

    console.log(`Task sent with correlationId: ${correlationId}`);
    return { role: createdRole, correlationId };
  }

  async processTask(id: number): Promise<Role> {
    return new Promise((resolve, reject) => {
      this.rabbitMQService.consumeMessages(
        this.TASK_QUEUE,
        async (message) => {
          console.log('Received message:', message);
          const task = JSON.parse(message);
          if (task.id === id) {
            console.log('Processing task:', task);

            try {
              //Xử lý task ở đây
              const data = await this.prismaService.role.findUnique({
                where: { id: task.id },
              });
              console.log('Success task:', data);
              resolve(data);
            } catch (error) {
              reject('Error processing task');
            }
          }
        },
        { noAck: false },
      );
    });
  }
}
