import { vi } from 'vitest';
import { User } from '../../src/database/models/User';
import { mongoReturnUser, validCreationUser } from '../mocks/users';
import { App } from '../../src/App';
import { DatabaseMockClass } from '../mocks/DatabaseMockClass';
import supertest from 'supertest';

const databaseMock = new DatabaseMockClass();
const { app } = new App(databaseMock);

export const getToken = async () => {
  const findMock = vi.spyOn(User, 'findOne').mockResolvedValue(null);
  const createMock = vi.spyOn(User, 'create').mockResolvedValue(mongoReturnUser as any);
  const { body } = await supertest(app).post('/user').send(validCreationUser);
  
  findMock.mockRestore();
  createMock.mockRestore();
  
  return `Bearer ${body.token}`;
};