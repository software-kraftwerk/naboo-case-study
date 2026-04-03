import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SignInInput, SignUpInput } from './types';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.schema';
import { ConfigService } from '@nestjs/config';
import { ContextWithJWTPayload } from './types/context';
import { GqlThrottlerGuard } from './gql-throttler.guard';

@Resolver('Auth')
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Mutation(() => Boolean)
  @UseGuards(GqlThrottlerGuard)
  @Throttle({ login: { limit: 5, ttl: 60_000 } })
  async login(
    @Args('signInInput') loginUserDto: SignInInput,
    @Context() ctx: ContextWithJWTPayload,
  ): Promise<boolean> {
    const token = await this.authService.signIn(loginUserDto);
    const expiresIn = Number(this.configService.get('JWT_EXPIRATION_TIME'));

    ctx.res.cookie('jwt', token, {
      httpOnly: true,
      domain: this.configService.get('FRONTEND_DOMAIN'),
      secure: true,
      sameSite: 'strict',
      maxAge: expiresIn * 1000,
    });

    return true;
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
