import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    //@InjectRepository(User)
    //private userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }
 
  async findAll() {
    //return await this.userRepository.find();
  }

  // async createUserWithTransaction(createUserDto: CreateUserDto) {
  //   return await this.userRepository.manager.transaction(
  //     async (transactionalEntityManager) => {
  //       try {
  //         // Thêm người dùng mới
  //         const newUser = await transactionalEntityManager.save(User, {
  //           email: createUserDto.email,
  //           password: createUserDto.password,
  //           isActive: createUserDto.isActive,
  //           username: createUserDto.username,
  //           imgName: createUserDto.imgName,
  //           phone: createUserDto.phone,
  //           codeId: createUserDto.codeId,
  //           codeExpired: createUserDto.codeExpired,
  //           refreshToken: createUserDto.refreshToken,
  //           roleId: createUserDto.roleId,
  //         });

  //         // Thực hiện các thao tác khác trong transaction (nếu cần)

  //         return newUser; // Trả về người dùng mới được tạo
  //       } catch (error) {
  //         // Xử lý lỗi nếu cần
  //         throw new Error('Error creating user: ' + error.message);
  //       }
  //     },
  //   );
  // }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
