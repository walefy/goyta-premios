import { HttpStatusCode } from '../enums/HttpStatusCode';
import { IAuthToken } from '../interfaces/AuthToken/IAuthToken';
import { IPassword } from '../interfaces/Password/IPassword';
import { CreationUser, IUser, UserWithoutId, UserWithoutPassword } from '../interfaces/user/IUser';
import { IUserModel } from '../interfaces/user/IUserModel';
import { IUserService } from '../interfaces/user/IUserService';
import { userCreationSchema, userUpdateSchema, loginSchema } from '../schemas';
import { validateSchema } from '../utils/schemaValidator';

export class UserService implements IUserService {
  #model: IUserModel;
  #tokenAuth: IAuthToken;
  #password: IPassword;

  constructor(model: IUserModel, tokenAuth: IAuthToken, passowrd: IPassword) {
    this.#model = model;
    this.#tokenAuth = tokenAuth;
    this.#password = passowrd;
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

    const hashedPassword = await this.#password.hash(newUser.password);
    const user = await this.#model.create({ ...newUser, password: hashedPassword }, 'user');
    const { id, email, name, role } = user;
    const token = this.#tokenAuth.sign({ id, email, name, role });
    return { status: HttpStatusCode.CREATED, data: { token } };
  }

  async createAdmin(newUser: CreationUser, tokenAdmin: string) {
    const validation = validateSchema(userCreationSchema, newUser);

    if (!validation.valid) {
      return {
        status: HttpStatusCode.BAD_REQUEST,
        data: { message: validation.error || 'Invalid data' },
      };
    }

    if (tokenAdmin !== process.env.ADMIN_PASS) {
      return {
        status: HttpStatusCode.UNAUTHORIZED,
        data: { message: 'Invalid tokenAdmin' }
      };
    }

    const userExists = await this.#model.findByEmail(newUser.email);
    if (userExists) {
      return {
        status: HttpStatusCode.CONFLICT,
        data: { message: 'User already registered' }
      };
    }

    const hashedPassword = await this.#password.hash(newUser.password);
    const user = await this.#model.create({ ...newUser, password: hashedPassword }, 'admin');
    
    const { id, email, name, role } = user;
    
    const token = this.#tokenAuth.sign({ id, email, name, role });
    return { status: HttpStatusCode.CREATED, data: { token } };
  }

  async login(email: string, password: string) {
    const validation = validateSchema(loginSchema, { email, password });
    if (!validation.valid) {
      return {
        status: HttpStatusCode.BAD_REQUEST,
        data: { message: validation.error || 'Invalid data' }
      };
    }

    const user = await this.#model.findByEmail(email);

    if (!user) {
      return {
        status: HttpStatusCode.UNAUTHORIZED,
        data: { message: 'Invalid email or password' }
      };
    }

    const isSamePassword = await this.#password.compare(password, user.password);

    if (!isSamePassword) {
      return {
        status: HttpStatusCode.UNAUTHORIZED,
        data: { message: 'Invalid email or password' }
      };
    }

    const { id, name, role } = user;
    const token = this.#tokenAuth.sign({ id, email, name, role });
    return { status: HttpStatusCode.OK, data: { token } };
  }

  async delete(id: IUser['id']) {
    const hasDeleted = await this.#model.delete(id);

    if (hasDeleted) return { status: HttpStatusCode.OK, data: null };
    return { status: HttpStatusCode.NOT_FOUND, data: null };
  }

  async update(id: IUser['id'], partialUser: Partial<UserWithoutId>) {
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

    if (partialUser.email) {
      const userExists = await this.#model.findByEmail(partialUser.email);

      if (userExists && userExists.id !== id) {
        return {
          status: HttpStatusCode.CONFLICT,
          data: { message: 'E-mail already registered' }
        };
      }
    }

    if (partialUser.password) {
      partialUser.password = await this.#password.hash(partialUser.password);
    }

    const updatedUser = await this.#model.update(id, partialUser);
    return { status: HttpStatusCode.OK, data: this.#removePassword(updatedUser) };
  }

  #removePassword(user: IUser): UserWithoutPassword {
    const { password, ...rest } = user;
    return rest;
  }
}
