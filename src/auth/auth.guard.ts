import { UsersService } from '../modules/users/users.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { SKIP_AUTH_GUARD } from './skip-auth-guard.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(
      SKIP_AUTH_GUARD,
      [context.getHandler(), context.getClass()],
    );
    if (skipAuth) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const token = this.extractToken(ctx.getContext().req);
    const req = ctx.getContext().req;

    if (!token) {
      throw new UnauthorizedException('Invalid token!');
    }

    try {
      const payload = await this.handleVerifyAsync(
        token,
        process.env.JWT_SECRET_KEY,
      );

      const user = await this.usersService.findOne(payload.id);
      req.user_data = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token!');
    }
  }

  private extractToken(req: any): string | undefined {
    const [type, token] = req.headers.authorization
      ? req.headers.authorization.split(' ')
      : [];
    if (!token) {
      throw new UnauthorizedException('Authorization header is missing');
    }
    return type === 'Bearer' ? token : undefined;
  }

  private async handleVerifyAsync(token: string, secret: string) {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: secret,
    });
    return payload;
  }

  async handleSignAsync(payload: object, exp: string) {
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: exp,
    });
    return token;
  }
}
