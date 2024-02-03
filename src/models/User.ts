import { IUserModel } from '../interfaces/user/IUserModel';
import { User } from '../database/models/User';
import { CreationUser, IUser, UserWithoutId, UserWithoutPassword } from '../interfaces/user/IUser';
import { Types, Document } from 'mongoose';

type UserWithMongoId = Document<unknown, {}, IUser> & IUser & {
  _id: Types.ObjectId;
};

export class UserModelMongo implements IUserModel {
  async findAll() {
    const users = await User.find();
    return users.map((user) => this.#clearUser(user));
  }

  async findById(id: IUser['id']): Promise<IUser | null> {
    const user = await User.findById(id);
    if (!user) return null;
    return this.#clearUser(user);
  }
  
  async create(newUser: CreationUser) {
    const user = await User.create(newUser);
    return this.#clearUser(user);
  }

  async update(id: IUser['id'], partialUser: Partial<UserWithoutId>) {
    await User.updateOne({ id }, { ...partialUser });
    const user = await this.findById(id);

    if (!user) {
      throw new Error('User not found after updated');
    }

    return user;
  }

  async delete(id: string): Promise<boolean> {
    await User.deleteOne({ id });
    
    const user = await this.findById(id);
    if (!user) return true;
    return false;
  }

  #clearUser(user: UserWithMongoId) {
    const { _id, ...userWithPass } = user.toJSON();
    return userWithPass;
  }
}
