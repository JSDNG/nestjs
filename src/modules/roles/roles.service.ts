import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { PrismaService } from '@/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prismaService: PrismaService) {}

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
}
