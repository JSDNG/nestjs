import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginAuthInput, RegisterAuthInput } from './dto/auth.input';
import { PrismaService } from '@/prisma.service';
import { User } from '@prisma/client';
import { comparePasswordHelpers, hashPasswordHelpers } from '@/helpers/util';
import { LoginResult } from './schemas/auth.schema';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { AuthGuard } from './auth.guard';
import { CustomNotFoundException } from '@/errors/error-codes.enum';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private authGuard: AuthGuard,
    @InjectQueue('mailQueue') private readonly mailQueue: Queue,
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (user) return true;
    return false;
  };

  async register(userData: RegisterAuthInput): Promise<User> {
    let checkEmail = await this.isEmailExist(userData.email);
    if (checkEmail) {
      throw new ConflictException('Tài khoản đã tồn tại');
    }

    const hassPass = await hashPasswordHelpers(userData.password);
    const codeId = uuidv4();
    const user = await this.prismaService.user.create({
      data: {
        ...userData,
        password: hassPass,
        isActive: false,
        codeId: codeId,
        roleId: 1,
        codeExpired: dayjs().add(5, 'minutes').toDate(),
      },
    });

    //Add job to queue
    await this.mailQueue.add(
      'sendEmail',
      {
        name: user?.username,
        email: user?.email,
        activationCode: codeId,
      },
      { delay: 1 * 60 * 1000 }, // 1 minutes delayed
    );

    return user;
  }

  async login(userData: LoginAuthInput): Promise<LoginResult> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: userData.email,
      },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('Account not found!');
      //throw new CustomNotFoundException();
    }

    const verify = await comparePasswordHelpers(
      userData.password,
      user.password,
    );

    if (!verify) {
      throw new BadRequestException('Dữ liệu đầu vào không hợp lệ');
    }

    // if (user.isActive === false) {
    //   throw new BadRequestException('Tài khoản chưa được kích hoạt.');
    // }

    const payload = {
      id: user.id,
      name: user.username,
      email: user.email,
    };
    const accessToken = await this.authGuard.handleSignAsync(
      payload,
      process.env.JWT_ACCESS_TOKEN_EXPIRED,
    );

    const refreshToken = await this.authGuard.handleSignAsync(
      payload,

      '7d',
    );
    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: refreshToken,
      },
    });

    return {
      data: user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(email: string): Promise<string> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
    const payload = {
      id: user.id,
      name: user.username,
      email: user.email,
    };
    const refreshToken = await this.authGuard.handleSignAsync(
      payload,

      '7d',
    );
    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: refreshToken,
      },
    });
    return await this.authGuard.handleSignAsync(
      payload,
      process.env.JWT_ACCESS_TOKEN_EXPIRED,
    );
  }
}
