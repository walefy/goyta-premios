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

describe('List User by id <GET /user/:id>', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user by id', async () => {
    vi.spyOn(User, 'findById').mockResolvedValue(mongoReturnUser as any);

    const request = supertest(app);
    const token = await getToken();
    const response = await request
      .get(`/user/${mongoReturnUser.id}`)
      .set('Authorization', token);

    const { password, ...user } = mongoReturnUser.toJSON();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(user);
  });
});
