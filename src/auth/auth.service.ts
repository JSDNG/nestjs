import {
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

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
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
        { message: 'User exist}' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hassPass = await hashPasswordHelpers(userData.password);

    const result = await this.prismaService.user.create({
      data: { ...userData, password: hassPass },
    });
    return result;
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
