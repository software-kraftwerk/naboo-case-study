import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { BaseAppModule } from 'src/app.module';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';

const LOGIN_MUTATION = `
  mutation {
    login(signInInput: { email: "ratelimit@test.com", password: "wrongpassword" })
  }
`;

describe('login rate limiting', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, BaseAppModule],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await closeInMongodConnection();
  });

  it('allows up to 5 login attempts then blocks with 429', async () => {
    // Attempts 1–5: should fail with wrong credentials, NOT with throttling
    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: LOGIN_MUTATION })
        .expect(200);

      const message = res.body.errors?.[0]?.message ?? '';
      expect(message).not.toMatch(/Too Many Requests/);
    }

    // Attempt 6: should be blocked by the throttler
    const throttled = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: LOGIN_MUTATION })
      .expect(200);

    expect(throttled.body.errors[0].message).toMatch(/Too Many Requests/);
  });
});
