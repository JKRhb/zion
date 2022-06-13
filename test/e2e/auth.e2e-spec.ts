import { INestApplication } from '@nestjs/common';
import { AxiosInstance } from 'axios';

import { emailExists, loginFailed } from './../../src/common/errors';
import { emptyDatabase } from './../utils/database';
import { getE2ETestResources } from '../utils/resources';

describe('/auth', () => {
  let app: INestApplication;
  let axios: AxiosInstance;

  beforeAll(async () => {
    const res = await getE2ETestResources();
    app = res.app;
    axios = res.axios;
  });

  beforeEach(async () => {
    await emptyDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST', () => {
    it('should fail to authenticate a user that does not exist', async () => {
      const credentials = {
        email: 'test@test.com',
        password: 'test123',
      };

      const { status, data } = await axios.post('/auth', credentials);

      expect(status).toBe(401);
      expect(data).toStrictEqual(loginFailed);
    });

    it('should fail to authenticate a user with the wrong password', async () => {
      const user = {
        email: 'test@test.com',
        password: 'test123',
      };
      await axios.post('/auth/register', user);

      const credentials = {
        email: 'test@test.com',
        password: 'test456',
      };
      const { status, data } = await axios.post('/auth', credentials);

      expect(status).toBe(401);
      expect(data).toStrictEqual(loginFailed);
    });

    it('should authenticate a user', async () => {
      const user = {
        email: 'test@test.com',
        password: 'test123',
      };
      await axios.post('/auth/register', user);

      const credentials = {
        email: 'test@test.com',
        password: 'test123',
      };
      const { status, data } = await axios.post('/auth', credentials);

      expect(status).toBe(201);
      expect(data.accessToken).toBeDefined();
    });
  });

  describe('POST /register', () => {
    it('should fail registering a new user due to duplicate email', async () => {
      const user1 = {
        email: 'test@test.com',
        password: 'test123',
      };
      const user2 = {
        email: 'test@test.com',
        password: 'test123',
      };

      const responseUser1 = await axios.post('/auth/register', user1);
      const responseUser2 = await axios.post('/auth/register', user2);

      expect(responseUser1.status).toBe(201);
      expect(responseUser1.data.accessToken).toBeDefined();
      expect(responseUser2.status).toBe(409);
      expect(responseUser2.data).toStrictEqual(emailExists);
    });

    it('should register a new user', async () => {
      const user = {
        email: 'test@test.com',
        password: 'test123',
      };

      const { status, data } = await axios.post('/auth/register', user);

      expect(status).toBe(201);
      expect(data.accessToken).toBeDefined();
    });
  });
});