import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from '../../user/user.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { User } from 'src/user/user.schema';
import { Activity } from 'src/activity/activity.schema';
import { ContextWithJWTPayload } from 'src/auth/types/context';

@Resolver('Me')
export class MeResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  @UseGuards(AuthGuard)
  async getMe(@Context() context: ContextWithJWTPayload): Promise<User> {
    // the AuthGard will add the user to the context
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.userService.getById(context.jwtPayload.id);
  }

  @Mutation(() => [Activity])
  @UseGuards(AuthGuard)
  async addFavoriteActivity(
    @Args('activityId') activityId: string,
    @Context() ctx: ContextWithJWTPayload,
  ): Promise<Activity[]> {
    const user = await this.userService.addFavoriteActivity(
      ctx.jwtPayload.id,
      activityId,
    );
    return this.userService.getFavoriteActivitiesFromIds(
      user.favoriteActivityIds,
    );
  }

  @Mutation(() => [Activity])
  @UseGuards(AuthGuard)
  async removeFavoriteActivity(
    @Args('activityId') activityId: string,
    @Context() ctx: ContextWithJWTPayload,
  ): Promise<Activity[]> {
    const user = await this.userService.removeFavoriteActivity(
      ctx.jwtPayload.id,
      activityId,
    );
    return this.userService.getFavoriteActivitiesFromIds(
      user.favoriteActivityIds,
    );
  }

  @Mutation(() => [Activity])
  @UseGuards(AuthGuard)
  async reorderFavoriteActivities(
    @Args('activityIds', { type: () => [String] }) activityIds: string[],
    @Context() ctx: ContextWithJWTPayload,
  ): Promise<Activity[]> {
    const user = await this.userService.reorderFavoriteActivities(
      ctx.jwtPayload.id,
      activityIds,
    );
    return this.userService.getFavoriteActivitiesFromIds(
      user.favoriteActivityIds,
    );
  }
}
