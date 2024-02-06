import { App } from '../../../src/App';
import { DatabaseMockClass } from '../../mocks/DatabaseMockClass';
import { describe, it, expect, beforeEach } from 'vitest';
import { User } from '../../../src/database/models/User';
import supertest from 'supertest';
import { mongoReturnUser } from '../../mocks/users';
import { vi } from 'vitest';
import { getToken } from '../../helpers/getToken';

const databaseMock = new DatabaseMockClass();

const { app } = new App(databaseMock);

describe('List All Users <GET /user>', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.skip('should return all users', async () => {
    // admin user not implemented
    vi.spyOn(User, 'find').mockResolvedValue([mongoReturnUser] as any);

    const request = supertest(app);
    const token = await getToken();
    const response = await request
      .get('/user')
      .set('Authorization', token);

    expect(response.status).toBe(200);
    const { password, ...user } = mongoReturnUser;
    expect(response.body).toEqual([user]);
  });

  it('should return 403 if token is not admin', async () => {
    vi.spyOn(User, 'find').mockResolvedValue([mongoReturnUser] as any);

    const request = supertest(app);
    const token = await getToken();
    const response = await request
      .get('/user')
      .set('Authorization', token);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: 'You do not have permission',
    });
  });
});
