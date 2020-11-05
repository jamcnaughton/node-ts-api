import {Server} from 'http';
import * as SuperTest from 'supertest';
import {testingSeedUtility} from '../../../tools/test';
import {redisService, server} from '../../../tools/test';
const expect = require('chai').expect;

// Tests for this controller.
describe(
  '/api/1.0/languages',
  () => {

    // Establish test server.
    let app: SuperTest.SuperTest<SuperTest.Test>;
    let instance: Server;

    // Run before all tests.
    before(
      () => {
        instance = server();
        app = SuperTest(instance);
        return testingSeedUtility.seed();
      }
    );

    // Run before each test.
    beforeEach(
      () => testingSeedUtility.seedRedis()
    );

    // Run after each test.
    afterEach (
      () => redisService.clearDb()
    );

    // Run after all tests.
    after(
      () => {
        redisService.clearDb();
        instance.close();
      }
    );

    // Tests for an end point.
    describe(
      'GET',
      () => {

        // Run a test.
        it(
          'should contain a list of languages with correct tenant',
          () => app.get('/api/1.0/language?tenant=demo').expect(
            (res: SuperTest.Response) => {
              expect(res.status).to.be.a('number').equal(200);
              expect(res.body).to.have.property('payload');
              expect(res.body['payload']).to.have.property('results');
              expect(res.body['payload']['results']).to.not.have.lengthOf(0);
              expect(res.body['payload']['results'][0]).to.have.property('name');
              expect(res.body['payload']['results'][0]).to.have.property('code');
            }
          )
        );

        // Run a test.
        it(
          'should return an error with an incorrect tenant',
          () => app.get('/api/1.0/language/?tenant=not-real').expect(
            (res: SuperTest.Response) => {
              expect(res.status).to.be.a('number').equal(400);
            }
          )
        );

      }
    );

  }
);
