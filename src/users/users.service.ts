import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserInput } from './dto/inputs/create-user.input';
import { CreateUsersInput } from './dto/inputs/create-users.input';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  };
  async create(createUserInput: CreateUserInput): Promise<UserDocument> {
    const user = new this.userModel({
      ...createUserInput,
    });
    return user.save();
  }

  async createUsers(
    createUsersInput: CreateUsersInput,
  ): Promise<UserDocument[]> {
    const users = createUsersInput.users.map((userInput) => ({
      ...userInput,
    }));

    const result = await this.userModel.insertMany(users);

    return result;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec(); // Giữ nguyên
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(updateUserInput: UpdateUserInput): Promise<UserDocument> {
    const user = await this.userModel
      .findById(new Types.ObjectId(updateUserInput.id))
      .exec();
    if (!user) {
      throw new NotFoundException(
        `User with ID ${updateUserInput.id} not found`,
      );
    }
    user.name = updateUserInput.name;
    return user.save();
  }

  async remove(id: string): Promise<string> {
    const result = await this.userModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
    if (result.deletedCount > 0) {
      return `User with ID ${id} has been successfully deleted.`;
    } else {
      return `User with ID ${id} could not be found.`;
    }
  }
}
