import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginAuthInput, RegisterAuthInput } from './dto/auth.input';
import { PrismaService } from '@/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { comparePasswordHelpers, hashPasswordHelpers } from '@/helpers/util';
import { LoginResult } from './schemas/auth.schema';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
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
      //throw new NotFoundException(`User exist`);
      throw new HttpException(
        { message: 'User exist' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hassPass = await hashPasswordHelpers(userData.password);
    const codeId = uuidv4();
    const user = await this.prismaService.user.create({
      data: {
        ...userData,
        password: hassPass,
        isActive: false,
        codeId: codeId,
        codeExpired: dayjs().add(5, 'minutes').toDate(),
      },
    });

    // Add job to queue
    await this.mailQueue.add(
      'sendEmail',
      {
        name: user?.username,
        email: user?.email,
        activationCode: codeId,
      },
      { delay: 3 * 60 * 1000 }, // 3 minutes delayed
    );

    return user;
  }

  async login(userData: LoginAuthInput): Promise<LoginResult> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (!user) {
      throw new HttpException(
        { message: 'Account not found!' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const verify = await comparePasswordHelpers(
      userData.password,
      user.password,
    );

    if (!verify) {
      throw new HttpException(
        { message: 'Incorrect password!' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.isActive === false) {
      throw new BadRequestException('Tài khoản chưa được kích hoạt.');
    }
    const payload = {
      id: user.id,
      name: user.username,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRED,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '7d',
    });
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
}
