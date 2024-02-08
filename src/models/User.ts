import { IUserModel } from '../interfaces/user/IUserModel';
import { User } from '../database/models/User';
import { CreationUser, IUser, UserWithoutId } from '../interfaces/user/IUser';
import { EntityWithMongoId } from '../interfaces/EntityWithMongoId';

export class UserModelMongo implements IUserModel {
  async findAll() {
    const users = await User.find();
    return users.map((user) => this.#clearUser(user));
  }

  async findById(id: IUser['id']) {
    const user = await User.findById(id);
    if (!user) return null;
    return this.#clearUser(user);
  }

  async findByEmail(email: string) {
    const user = await User.findOne({ email });
    if (!user) return null;
    return this.#clearUser(user);
  }
  
  async create(newUser: CreationUser, role: IUser['role']) {
    const user = await User.create({ ...newUser, role });
    return this.#clearUser(user);
  }

  async update(id: IUser['id'], partialUser: Partial<UserWithoutId>) {
    await User.updateOne({ _id: id }, { ...partialUser });

    const user = await this.findById(id);

    if (!user) {
      throw new Error('User not found!');
    }

    return user;
  }

  async delete(id: string) {
    await User.deleteOne({ _id: id });

    const user = await this.findById(id);

    if (!user) return true;
    return false;
  }

  #clearUser(user: EntityWithMongoId<IUser>): IUser {
    const cleanUser = user.toObject();
    const { _id, ...userWithoutId } = cleanUser;
    return userWithoutId;
  }
}
