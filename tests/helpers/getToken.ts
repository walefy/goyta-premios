import { validCreationUser } from '../mocks/users';
import supertest from 'supertest';
import { Express } from 'express';

export const getToken = async (app: Express) => {
  const newEmail = `test${Math.random()}@test.com`;
  const { body } = await supertest(app).post('/user').send({ ...validCreationUser, email: newEmail });

  return `Bearer ${body.token}`;
};

export const getAdminToken = async (app: Express) => {
  const newEmail = `test${Math.random()}@test.com`;
  const { body } = await supertest(app).post('/user/admin').send({ ...validCreationUser, email: newEmail });
  
  return `Bearer ${body.token}`;
};
