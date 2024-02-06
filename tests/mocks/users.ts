import { Types, Document } from 'mongoose';
import { CreationUser, IUser } from '../../src/interfaces/user/IUser';

type UserWithMongoId = IUser & {
  _id: Types.ObjectId;
  toJSON: () => IUser;
};

const getMongoId = () => {
  const id = new Types.ObjectId();
  return {
    _id: id,
    id: id.toString(),
  };
};

const toJSON = (data: any) => {
  delete data._id;
  delete data.toJSON;
  return data;
};

const getMongoUser = () => {
  const user = {
    ...getMongoId(),
    toJSON: () => toJSON(user),
    email: 'test@test.com',
    password: 'password',
    name: 'Test User',
    phone: '11111111111',
    image: 'https://www.google.com',
  };

  return user;
};

export const validCreationUser: CreationUser = {
  email: 'test@test.com',
  password: 'password',
  name: 'Test User',
  phone: '11111111111',
  image: 'https://www.google.com',
};

export const mongoReturnUser = {
  ...getMongoUser()
}
