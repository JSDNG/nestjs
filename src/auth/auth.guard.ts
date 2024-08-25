import { UsersService } from '@/modules/users/users.service';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const token = this.extractToken(ctx.getContext().req);

    if (!token) {
      throw new UnauthorizedException("Access Token không hợp lệ ");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      const user = await this.usersService.findOne(payload.id);
      ctx.getContext().req.user_data = user;

      return true;
    } catch (error) {
      console.log('err=> ', error);
      throw new HttpException('Invalid token!', HttpStatus.UNAUTHORIZED);
    }
  }

  private extractToken(req: any): string | undefined {
    const [type, token] = req.headers.authorization
      ? req.headers.authorization.split(' ')
      : [];

    return type === 'Bearer' ? token : undefined;
  }
}
