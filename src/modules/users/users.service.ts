import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserInput, UserFilter } from './dto/inputs/create-user.input';
import { CreateUsersInput } from './dto/inputs/create-users.input';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '@/prisma.service';
import { User } from '@prisma/client';
import { UserPagination } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  isEmailExist = async (email: string) => {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (user) return true;
    return false;
  };
  async create(createUserInput: CreateUserInput): Promise<User> {
    let checkEmail = await this.isEmailExist(createUserInput.email);
    if (checkEmail) {
      throw new NotFoundException(`User exist`);
    }
    return await this.prismaService.user.create({ data: createUserInput });
  }

  async createUsers(createUsersInput: CreateUsersInput): Promise<User[]> {
    if (
      !createUsersInput ||
      !createUsersInput.users ||
      !Array.isArray(createUsersInput.users)
    ) {
      throw new Error('Invalid input: users is undefined or not an array');
    }

    // Kiểm tra xem các đối tượng trong mảng có đúng định dạng không
    const users = createUsersInput.users.map((userInput) => ({
      ...userInput,
    }));

    try {
      await this.prismaService.user.createMany({
        data: users,
      });
      const createdUsers = await this.prismaService.user.findMany();

      return createdUsers;
    } catch (error) {
      console.error('Error creating users:', error);
      throw new Error('Failed to create users');
    }
  }

  async findAll(filter: UserFilter): Promise<UserPagination> {
    const search = filter.search || '';
    const limit = Number(filter.limit) || 10;
    const page = Number(filter.page) || 1;

    const skip = page > 1 ? (page - 1) * limit : 0;
    const users = await this.prismaService.user.findMany({
      take: limit,
      skip,
      where: {
        OR: [
          {
            username: {
              contains: search,
            },
          },
          {
            email: {
              contains: search,
            },
          },
        ],
      },
    });
    const total = users.length;
    return {
      data: users,
      total,
      limit,
      page,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return await this.prismaService.user.findUnique({ where: { email } });
  }

  async update(updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.prismaService.user.findFirst({
      where: { id: updateUserInput.id },
    });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return await this.prismaService.user.update({
      where: {
        id: updateUserInput.id,
      },
      data: updateUserInput,
    });
  }

  async remove(id: number): Promise<string> {
    const user = await this.prismaService.user.findFirst({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    try {
      await this.prismaService.user.delete({ where: { id } });
      return `User with ID ${id} has been successfully deleted.`;
    } catch (error) {
      console.log(error);
      return 'Error form server';
    }
  }
}
