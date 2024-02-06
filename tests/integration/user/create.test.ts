import { App } from '../../../src/App';
import { DatabaseMockClass } from '../../mocks/DatabaseMockClass';
import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import { validCreationUser } from '../../mocks/users';
import { vi } from 'vitest';

const databaseMock = new DatabaseMockClass();

const { app } = new App(databaseMock);

describe('Create User <POST /user>', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    const response = await request.post('/user').send(validCreationUser);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: 'User already registered' });
  });
});

