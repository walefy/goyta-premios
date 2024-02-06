export interface IUser {
  id: string,
  name: string;
  email: string;
  password: string;
  phone: string;
  image?: string;
  role: 'user' | 'admin';
}

export type UserWithoutId = Omit<IUser, 'id'>;
export type UserWithoutPassword = Omit<IUser, 'password'>;
export type CreationUser = Omit<IUser, 'id'>;
