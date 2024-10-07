import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginAuthInput, RegisterAuthInput } from './dto/auth.input';
import { User } from '@/modules/users/schemas/user.schema';
import { LoginResult } from './schemas/auth.schema';
import { SkipAuthGuard } from './skip-auth-guard.decorator';
import { UploadUrlResponse } from '@/files/entities/file.entity';
import { FilesService } from '@/files/files.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService,
    private readonly filesService: FilesService
  ) {}

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

  @Mutation(() => UploadUrlResponse)
  async generateUploadUrl(
    @Args('contentType') contentType: string,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<UploadUrlResponse> {
    console.log('contentType', contentType);
    const uploadUrl = await this.filesService.generateUploadUrl(
      id,
      contentType,
    );
    return { uploadUrl };
  }
}
