import {Server} from 'http';
import * as SuperTest from 'supertest';
import {testingSeedUtility} from '../../../tools/test';
import {redisService, server} from '../../../tools/test';
const expect = require('chai').expect;

describe('/api/1.0/languages', () => {
  let app: SuperTest.SuperTest<SuperTest.Test>;
  let instance: Server;

  before(
    () => {
      instance = server();
      app = SuperTest(instance);
    }
  );

  before(
    () => testingSeedUtility.seed()
  );

  afterEach (
    () => redisService.clearDb()
  );

  beforeEach(
    () => testingSeedUtility.seedRedis()
  );

  after(
    () => {
      redisService.clearDb();
      instance.close();
    }
  );

  describe('GET', () => {
    it(
      'should contain a list of languages with correct tenant',
      () => app.get('/api/1.0/language?tenant=demo')
      .expect(
        (res: SuperTest.Response) => {
          expect(res.status).to.be.a('number').equal(200);
          expect(res.body).to.have.property('results');
          expect(res.body['results']).to.have.property('languages');
          expect(res.body['results']['languages']).to.not.have.lengthOf(0);
          expect(res.body['results']['languages'][0]).to.have.property('name');
          expect(res.body['results']['languages'][0]).to.have.property('code');
        }
      )
    );

    it('should return an error with an incorrect tenant', () => app
      .get('/api/1.0/language/?tenant=not-real')
      .expect((res: SuperTest.Response) => {
        expect(res.status).to.be.a('number').equal(500);
      }));
  });

});
