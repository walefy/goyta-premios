import { IServiceResponse } from '../IServiceResponse';
import { CreationUser, IUser, UserWithoutId, UserWithoutPassword } from './IUser';

export interface IUserService {
  create(newUser: CreationUser): Promise<IServiceResponse<string>>;
  findById(id: IUser['id']): Promise<IServiceResponse<UserWithoutPassword | null>>;
  findAll(): Promise<IServiceResponse<UserWithoutPassword[]>>;
  update(id: IUser['id'], partialUser: Partial<UserWithoutId>): Promise<IServiceResponse<UserWithoutPassword>>;
  delete(id: IUser['id']): Promise<IServiceResponse<null>>;
}
