import { HttpStatusCode } from '../enums/HttpStatusCode';
import { IAuthToken } from '../interfaces/AuthToken/IAuthToken';
import { CreationUser, IUser, UserWithoutPassword } from '../interfaces/user/IUser';
import { IUserModel } from '../interfaces/user/IUserModel';
import { IUserService } from '../interfaces/user/IUserService';
import { userCreationSchema, userUpdateSchema } from '../schemas';
import { validateSchema } from '../utils/schemaValidator';

export class UserService implements IUserService {
  #model: IUserModel;
  #tokenAuth: IAuthToken;

  constructor(model: IUserModel, tokenAuth: IAuthToken) {
    this.#model = model;
    this.#tokenAuth = tokenAuth;
  }

  async findAll() {
    const users = await this.#model.findAll();
    const usersWithoutPass = users.map((user) => this.#removePassword(user));
    return { status: HttpStatusCode.OK, data: usersWithoutPass }
  }

  async findById(id: IUser['id']) {
    const user = await this.#model.findById(id);

    if (!user) return { status: HttpStatusCode.NOT_FOUND, data: null };

    const userWithoutPass = this.#removePassword(user);
    return { status: HttpStatusCode.OK, data: userWithoutPass };
  }

  async create(newUser: CreationUser) {
    const validation = validateSchema(userCreationSchema, newUser);

    if (!validation.valid) {
      return {
        status: HttpStatusCode.BAD_REQUEST,
        data: { message: validation.error || 'Invalid data' },
      };
    }

    const userExists = await this.#model.findByEmail(newUser.email);

    if (userExists) {
      return {
        status: HttpStatusCode.CONFLICT,
        data: { message: 'User already registered' }
      };
    }

    const user = await this.#model.create(newUser);
    const { id, email, name } = this.#removePassword(user);
    const token = this.#tokenAuth.sign({ id, email, name, role: 'user' });
    return { status: HttpStatusCode.CREATED, data: token };
  }

  async delete(id: IUser['id']) {
    // TODO: verify if the user that is trying to delete is the same that is logged in
    const hasDeleted = await this.#model.delete(id);

    if (hasDeleted) return { status: HttpStatusCode.OK, data: null };
    return { status: HttpStatusCode.NOT_FOUND, data: null };
  }

  async update(id: IUser['id'], partialUser: Partial<UserWithoutPassword>) {
    const validation = validateSchema(userUpdateSchema, partialUser);

    if (!validation.valid) {
      return {
        status: HttpStatusCode.BAD_REQUEST,
        data: { message: validation.error || 'Invalid data' }
      };
    }
    
    const user = await this.#model.findById(id);
  
    if (!user) {
      return {
        status: HttpStatusCode.NOT_FOUND,
        data: { message: 'User not found' }
      };
    }

    const updatedUser = await this.#model.update(id, partialUser);
    return { status: HttpStatusCode.OK, data: this.#removePassword(updatedUser) };
  }

  #removePassword(user: IUser): UserWithoutPassword {
    const { password, ...rest } = user;
    return rest;
  }
}
