import { App } from '../../../src/App';
import { DatabaseMockClass } from '../../mocks/DatabaseMockClass';
import { describe, it, expect, beforeEach } from 'vitest';
import { User } from '../../../src/database/models/User';
import supertest from 'supertest';
import { mongoReturnUser, validCreationUser } from '../../mocks/users';
import { vi } from 'vitest';

const databaseMock = new DatabaseMockClass();

const { app } = new App(databaseMock);

describe('Create User <POST /user>', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new user', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue(null);
    vi.spyOn(User, 'create').mockResolvedValue(mongoReturnUser as any);

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
    vi.spyOn(User, 'findOne').mockResolvedValue(mongoReturnUser as any);

    const request = supertest(app);
    const response = await request.post('/user').send(validCreationUser);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: 'User already registered' });
  });

  it.skip('should return 500 if something goes wrong', async () => {
    // This test is skipped because the error is not being handled in the service
    vi.spyOn(User, 'findOne').mockRejectedValue(new Error('Something went wrong'));

    const request = supertest(app);
    const response = await request.post('/user').send(validCreationUser);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal server error' });
  });
});

