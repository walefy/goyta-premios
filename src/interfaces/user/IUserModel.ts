import { CreationUser, IUser, UserWithoutId } from './IUser';

export interface IUserModel {
  create(newUser: CreationUser): Promise<IUser>;
  findById(id: IUser['id']): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  update(id: IUser['id'], partialUser: Partial<UserWithoutId>): Promise<IUser>;
  delete(id: IUser['id']): Promise<boolean>;
}
