import { IServiceResponse } from '../IServiceResponse';
import { CreationUser, User, UserWithoutId, UserWithoutPassword } from './IUser';

export interface IUserService {
  create(newUser: CreationUser): Promise<IServiceResponse<UserWithoutPassword>>;
  findById(id: User['id']): Promise<IServiceResponse<UserWithoutPassword>>;
  findAll(): Promise<IServiceResponse<UserWithoutPassword[]>>;
  update(partialUser: Partial<UserWithoutId>): Promise<IServiceResponse<UserWithoutPassword>>;
  delete(id: User['id']): Promise<IServiceResponse<void>>;
}
