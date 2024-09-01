import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginAuthInput, RegisterAuthInput } from './dto/auth.input';
import { User } from '@/modules/users/schemas/user.schema';
import { LoginResult } from './schemas/auth.schema';
import { SkipAuthGuard } from './skip-auth-guard.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User, { name: 'register' })
  @SkipAuthGuard()
  createAuth(@Args('data') data: RegisterAuthInput) {
    return this.authService.register(data);
  }

  @Mutation(() => LoginResult)
  @SkipAuthGuard()
  async login(@Args('data') data: LoginAuthInput): Promise<LoginResult> {
    return await this.authService.login(data);
  }

  @Mutation(() => String, { name: 'refreshAccessToken' })
  async refreshAccessToken(@Args('email') email: string) {
    return this.authService.refreshToken(email);
  }
}
