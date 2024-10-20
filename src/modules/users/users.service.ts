import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserInput } from './dto/inputs/create-user.input';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma.service';
import { User } from '@prisma/client';
import { IPaginatedType } from '../../pagination/paginated.decorator';
import { Filter } from '../../pagination/filter.input';

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
  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async getUsersPagination(filter: Filter): Promise<IPaginatedType<User>> {
    const users = await this.prismaService.user.findMany({
      take: filter.limit,
      skip: filter.offset,
      include: { role: true },
    });
    const totalCount = await this.prismaService.user.count();
    const edges = users.map((user) => ({
      cursor: user.id.toString(),
      node: user,
    }));

    return {
      edges,
      totalCount: users.length,
      hasNextPage: filter.offset + filter.limit < totalCount,
      hasPreviousPage: filter.offset > 0,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    };
  }
  async findOne(id: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.prismaService.user.findFirst({
      where: { id: updateUserInput.id },
      include: { role: true },
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
