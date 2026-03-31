import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { SignInDto, SignInInput, SignUpInput } from './types';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.schema';
import { ConfigService } from '@nestjs/config';
import { ContextWithJWTPayload } from './types/context';

@Resolver('Auth')
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Mutation(() => SignInDto)
  async login(
    @Args('signInInput') loginUserDto: SignInInput,
    @Context() ctx: ContextWithJWTPayload,
  ): Promise<SignInDto> {
    const data = await this.authService.signIn(loginUserDto);
    ctx.res.cookie('jwt', data.access_token, {
      httpOnly: true,
      domain: this.configService.get('FRONTEND_DOMAIN'),
      secure: true,
      sameSite: 'strict',
    });

    return data;
  }

  @Mutation(() => User)
  async register(
    @Args('signUpInput') createUserDto: SignUpInput,
  ): Promise<User> {
    return this.authService.signUp(createUserDto);
  }

  @Mutation(() => Boolean)
  async logout(@Context() ctx: ContextWithJWTPayload): Promise<boolean> {
    ctx.res.clearCookie('jwt', {
      httpOnly: true,
      domain: this.configService.get('FRONTEND_DOMAIN'),
    });
    return true;
  }
}
