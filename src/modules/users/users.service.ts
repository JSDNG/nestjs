import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserInput } from './dto/inputs/create-user.input';
import { CreateUsersInput } from './dto/inputs/create-users.input';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '@/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private userPrisma: PrismaService) {}

  //   isEmailExist = async (email: string) => {
  //     const user = await this.userPrisma.exists({ email });
  //     if (user) return true;
  //     return false;
  //   };
  async create(createUserInput: CreateUserInput): Promise<User> {
    return await this.userPrisma.user.create({ data: createUserInput });
  }

  async createUsers(createUsersInput: CreateUsersInput): Promise<User[]> {
    if (!createUsersInput || !createUsersInput.users) {
      throw new Error('Invalid input: users is undefined');
    }

    const users = createUsersInput.users.map((userInput) => ({
      ...userInput,
    }));

    // Execute createMany and get the count of created users
    const result = await this.userPrisma.user.createMany({ data: users });
    if (result.count > 0) {
      // Fetch and return the created users
      const createdUsers = await this.userPrisma.user.findMany();
      return createdUsers;
    }

    return [];
  }

  async findAll(): Promise<User[]> {
    return await this.userPrisma.user.findMany();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userPrisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return await this.userPrisma.user.findUnique({ where: { email } });
  }

  async update(updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.userPrisma.user.findFirst({
      where: { id: updateUserInput.id },
    });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return await this.userPrisma.user.update({
      where: {
        id: updateUserInput.id,
      },
      data: updateUserInput,
    });
  }

  async remove(id: number): Promise<string> {
    const user = await this.userPrisma.user.findFirst({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    try {
      await this.userPrisma.user.delete({ where: { id } });
      return `User with ID ${id} has been successfully deleted.`;
    } catch (error) {
      console.log(error);
      return 'Error form server';
    }
  }
}
