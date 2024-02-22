import { app, clearDatabase } from '../AppTest';
import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import supertest from 'supertest';
import { vi } from 'vitest';
import { getAdminToken, getToken } from '../helpers/getToken';
import jwt from 'jsonwebtoken';
import { validCreationUser } from '../mocks/users';
import { User } from '../../src/database/models/User';

describe('Integration test (User)', () => {
  const originalEnv = process.env;

  afterEach(async () => {
    await clearDatabase();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
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

  it('should return 400 when get user with invalid id', async () => {
    const request = supertest(app);
    const token = await getToken(app);

    const response = await request.get('/user/123').set('Authorization', token);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid id' });
  });

  it('should return 401 when logging in with a non-existing user', async () => {
    const token = await getToken(app);
    const request = supertest(app);
    const { id } = jwt.decode(token.split(' ')[1]) as { id: string };

    await request.delete(`/user/${id}`).set('Authorization', token);
    const response = await request.delete(`/user/${id}`).set('Authorization', token);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid token' });
  });

  it('should return 404 if user not found', async () => {
    const request = supertest(app);
    const token = await getToken(app);

    const response = await request.get('/user/65c63c36e7b88cdbe5808371').set('Authorization', token);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User not found' });
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

  it('should return 401 if invalid jwt token', async () => {
    const request = supertest(app);
    const response = await request.get('/user').send().set('Authorization', 'Bearer invalidToken');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid token' });
  });

  it('should return 401 if wrong password', async () => {
    const request = supertest(app);
    await request.post('/user').send(validCreationUser);
    const response = await request.post('/user/login').send({
      email: validCreationUser.email,
      password: 'invalidPassword'
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid email or password' });
  });

  it('should return 400 if wring email', async () => {
    const request = supertest(app);
    const response = await request.post('/user/login').send({
      email: 'email@notExist.com',
      password: 'invalidPassword'
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid email or password' });
  });

  it('should update user name', async () => {
    const request = supertest(app);
    const token = await getToken(app);

    const user = jwt.decode(token.split(' ')[1]) as { id: string };
    const response = await request
      .put(`/user/${user.id}`)
      .send({ name: 'New Name' })
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', 'New Name');
  });

  it('should update user email', async () => {
    const request = supertest(app);
    const token = await getToken(app);

    const user = jwt.decode(token.split(' ')[1]) as { id: string };
    const response = await request
      .put(`/user/${user.id}`)
      .send({ email: 'newEmail@email.com' })
      .set('Authorization', token);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email', 'newEmail@email.com');
  });

  it('should update user phone', async () => {
    const request = supertest(app);
    const token = await getToken(app);

    const user = jwt.decode(token.split(' ')[1]) as { id: string };
    const response = await request
      .put(`/user/${user.id}`)
      .send({ phone: '11111111111' })
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('phone', '11111111111');
  });

  it('should update user password', async () => {
    const request = supertest(app);
    const token = await getToken(app);

    const user = jwt.decode(token.split(' ')[1]) as { id: string };
    const response = await request
      .put(`/user/${user.id}`)
      .send({ password: 'newPassword' })
      .set('Authorization', token);

    const updatedUser = await User.findById(user.id);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('phone');
    expect(response.body).toHaveProperty('role');
    expect(updatedUser?.password).not.toBe('newPassword');
  });

  it('should return 400 if invalid data is sent to update', async () => {
    const request = supertest(app);
    const token = await getToken(app);

    const user = jwt.decode(token.split(' ')[1]) as { id: string };
    const response = await request
      .put(`/user/${user.id}`)
      .send({ email: 'invalidEmail' })
      .set('Authorization', token);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Invalid email at email'
    });
  });

  it('should delete user', async () => {
    const request = supertest(app);
    const token = await getToken(app);

    const user = jwt.decode(token.split(' ')[1]) as { id: string };
    const response = await request
      .delete(`/user/${user.id}`)
      .set('Authorization', token);

    const deletedUser = await User.findById(user.id);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(null);
    expect(deletedUser).toBe(null);
  });

  it('should return 403 if token is not admin when list all users', async () => {
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

  it('should return 403 if token is not the same user', async () => {
    const request = supertest(app);
    const token = await getToken(app);

    const user = jwt.decode(token.split(' ')[1]) as { id: string };
    const response = await request
      .put(`/user/${user.id}`)
      .send({ name: 'New Name' })
      .set('Authorization', await getToken(app));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: 'You do not have permission',
    });
  });

  it('should create admin user', async () => {
    process.env.ADMIN_PASS = 'testAdminPass';

    const request = supertest(app);
    const response = await request.post('/user/admin').send({ ...validCreationUser, tokenAdmin: process.env.ADMIN_PASS });

    const user = jwt.decode(response.body.token) as { role: string };
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
    expect(user.role).toBe('admin');
  });

  it('should return 401 if invalid tokenAdmin', async () => {
    process.env.ADMIN_PASS = 'testAdminPass';
    const request = supertest(app);
    const response = await request.post('/user/admin').send({ ...validCreationUser, tokenAdmin: 'invalid' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid tokenAdmin' });
  });

  it('should return 400 if no tokenAdmin is sent', async () => {
    const request = supertest(app);
    const response = await request.post('/user/admin').send(validCreationUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid data' });
  });

  it('should return 409 if user already exists', async () => {
    process.env.ADMIN_PASS = 'testAdminPass';
    const request = supertest(app);
    await request.post('/user').send(validCreationUser);
    const response = await request.post('/user/admin').send({ ...validCreationUser, tokenAdmin: process.env.ADMIN_PASS });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: 'User already registered' });
  });

  it('should return 400 if no email is sent on login', async () => {
    const request = supertest(app);
    const response = await request.post('/user/login').send({ password: 'password' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Required at email' });
  });

  it('should return 400 if no password is sent on login', async () => {
    const request = supertest(app);
    const response = await request.post('/user/login').send({ email: 'email@email.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Required at password' });
  });

  it('should return 200 and token if user login with success', async () => {
    const request = supertest(app);
    await request.post('/user').send(validCreationUser);
    const response = await request.post('/user/login').send({
      email: validCreationUser.email,
      password: validCreationUser.password
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  });

  it('should return 200 and token if admin login with success', async () => {
    process.env.ADMIN_PASS = 'testAdminPass';
    const request = supertest(app);
    const { body } = await request.post('/user/admin').send({ ...validCreationUser, tokenAdmin: process.env.ADMIN_PASS });
    const token = `Bearer ${body.token}`;
    const response = await request.post('/user/login').send({
      email: validCreationUser.email,
      password: validCreationUser.password,
    }).set('Authorization', token);

    const user = jwt.decode(response.body.token) as { role: string };
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
    expect(user.role).toBe('admin');
  });

  it('should return 404 if user not found on delete', async () => {
    const request = supertest(app);
    const token = await getToken(app);
    const user = jwt.decode(token.split(' ')[1]) as { id: string };

    const userTest = new User({ ...validCreationUser, password: 'password' });
    vi.spyOn(User, 'findById').mockResolvedValue(userTest);

    const response = await request
      .delete(`/user/${user.id}`)
      .set('Authorization', token);

    expect(response.status).toBe(404);
    expect(response.body).toEqual(null);
  });

  it('should return 404 if user not found on update', async () => {
    const request = supertest(app);
    const token = await getToken(app);
    const user = jwt.decode(token.split(' ')[1]) as { id: string };

    vi.spyOn(User, 'findById').mockResolvedValue(null);

    const response = await request
      .put(`/user/${user.id}`)
      .send({ name: 'New Name' })
      .set('Authorization', token);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User not found' });
  });

  it('should return 409 if try to update email to one that already exists', async () => {
    const request = supertest(app);

    const { body } = await request.post('/user').send(validCreationUser);
    const token = body.token;
    const user = jwt.decode(token) as { id: string };

    await request.post('/user').send({ ...validCreationUser, email: 'email@email.com' });

    const response = await request
      .put(`/user/${user.id}`)
      .send({ email: 'email@email.com' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: 'E-mail already registered' });
  });
});
