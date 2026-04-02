import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Activity } from 'src/activity/activity.schema';
import { User } from './user.schema';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @ResolveField(() => [Activity])
  async favoriteActivities(@Parent() user: User): Promise<Activity[]> {
    return this.userService.getFavoriteActivitiesFromIds(
      user.favoriteActivityIds,
    );
  }
}
