export interface IUser {
  id: string,
  name: string;
  email: string;
  password: string;
  phone: string;
  image?: string;
}

export type UserWithoutId = Omit<IUser, 'id'>;
export type UserWithoutPassword = Omit<IUser, 'password'>;
export type CreationUser = Omit<IUser, 'id'>;
