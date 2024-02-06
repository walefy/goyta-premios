import { validCreationUser } from '../mocks/users';
import { App } from '../../src/App';
import { DatabaseMockClass } from '../mocks/DatabaseMockClass';
import supertest from 'supertest';

const databaseMock = new DatabaseMockClass();
const { app } = new App(databaseMock);

export const getToken = async () => {
  const { body } = await supertest(app).post('/user').send(validCreationUser);

  return `Bearer ${body.token}`;
};

export const getAdminToken = async () => {
  const { body } = await supertest(app).post('/user/admin').send(validCreationUser);
  
  return `Bearer ${body.token}`;
};
