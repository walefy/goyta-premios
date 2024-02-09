import { app, clearDatabase } from '../AppTest';
import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import supertest from 'supertest';
import { vi } from 'vitest';
import { getAdminToken, getToken } from '../helpers/getToken';
import jwt from 'jsonwebtoken';
import { validCreationUser } from '../mocks/users';

describe('Integration test (User)', () => {
  afterEach(async () => {
    await clearDatabase();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(async () => {
    await clearDatabase();
  });

  it('should return user by id', async () => {
    const request = supertest(app);
    const token = await getToken(app);

    const user = jwt.decode(token.split(' ')[1]) as { id: string };
    const response = await request.get(`/user/${user.id}`).set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('phone');
    expect(response.body).toHaveProperty('role');
  });

  it('should return all users', async () => {
    const request = supertest(app);
    const token = await getAdminToken(app);

    await request.post('/user').send(validCreationUser);
    const response = await request.get('/user').set('Authorization', token);

      
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('email');
    expect(response.body[0]).toHaveProperty('phone');
    expect(response.body[0]).toHaveProperty('role');
  });

  it('should return 403 if token is not admin', async () => {
    const request = supertest(app);
    const token = await getToken(app);
    const response = await request
      .get('/user')
      .set('Authorization', token);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: 'You do not have permission',
    });
  });

  it('should create a new user', async () => {
    const request = supertest(app);
    const response = await request.post('/user').send(validCreationUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  });

  it('should return 400 if invalid data is sent', async () => {
    const request = supertest(app);
    const response = await request.post('/user').send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Required at name, Required at email, Required at password, Required at phone'
    });
  });

  it('should return 409 if user already exists', async () => {
    const request = supertest(app);
    await request.post('/user').send(validCreationUser);
    const response = await request.post('/user').send(validCreationUser);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: 'User already registered' });
  });
});