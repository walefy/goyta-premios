import { IServiceResponse } from '../IServiceResponse';
import { CreationUser, IUser, UserWithoutId, UserWithoutPassword } from './IUser';

type ResponseWithToken = {
  token: string;
};

export interface IUserService {
  create(newUser: CreationUser): Promise<IServiceResponse<ResponseWithToken>>;
  createAdmin(newUser: CreationUser, pass: string): Promise<IServiceResponse<ResponseWithToken>>;
  login(email: IUser['email'], password: IUser['password']): Promise<IServiceResponse<ResponseWithToken>>;
  findById(id: IUser['id']): Promise<IServiceResponse<UserWithoutPassword | null>>;
  findAll(): Promise<IServiceResponse<UserWithoutPassword[]>>;
  update(id: IUser['id'], partialUser: Partial<UserWithoutId>): Promise<IServiceResponse<UserWithoutPassword>>;
  delete(id: IUser['id']): Promise<IServiceResponse<null>>;
}
