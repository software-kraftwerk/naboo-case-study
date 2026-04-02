import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { SignUpInput } from 'src/auth/types';
import { Activity } from 'src/activity/activity.schema';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Activity.name)
    private activityModel: Model<Activity>,
  ) {}

  async getByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email }).exec();
  }

  async getById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(
    data: SignUpInput & {
      role?: User['role'];
    },
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new this.userModel({ ...data, password: hashedPassword });
    return user.save();
  }

  async countDocuments(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async addFavoriteActivity(userId: string, activityId: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          favoriteActivityIds: new mongoose.Types.ObjectId(activityId),
        },
      },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async removeFavoriteActivity(
    userId: string,
    activityId: string,
  ): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $pull: { favoriteActivityIds: new mongoose.Types.ObjectId(activityId) },
      },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async reorderFavoriteActivities(
    userId: string,
    activityIds: string[],
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const existingIds = new Set(
      user.favoriteActivityIds.map((id) => id.toString()),
    );
    const allValid = activityIds.every((id) => existingIds.has(id));
    if (!allValid || activityIds.length !== existingIds.size) {
      throw new NotFoundException('Invalid activity IDs for reorder');
    }

    user.favoriteActivityIds = activityIds.map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    return user.save();
  }

  async getFavoriteActivitiesFromIds(
    ids: mongoose.Types.ObjectId[],
  ): Promise<Activity[]> {
    if (!ids?.length) return [];

    const activities = await this.activityModel
      .find({ _id: { $in: ids } })
      .exec();

    const byId = new Map(activities.map((a) => [a._id.toString(), a]));

    return ids
      .map((id) => byId.get(id.toString()))
      .filter(Boolean) as Activity[];
  }

  async setDebugMode({
    userId,
    enabled,
  }: {
    userId: string;
    enabled: boolean;
  }): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        debugModeEnabled: enabled,
      },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
