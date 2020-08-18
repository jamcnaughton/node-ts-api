import {Server} from 'http';
import * as SuperTest from 'supertest';
import {testingSeedUtility} from '../../../tools/test';
import {redisService, server} from '../../../tools/test';

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
    it('should contain a list of languages with correct tenant', () => app
      .get('/api/1.0/languages?tenant=demo')
      .expect((res: SuperTest.Response) => {
        res.status.should.equal(200);
        res.body.hasOwnProperty('result').should.equal(true);
        res.body['result'].hasOwnProperty('languages').should.equal(true);
        res.body['result']['languages'].length.should.be.above(0);
        res.body['result']['languages'][0].hasOwnProperty('name').should.equal(true);
        res.body['result']['languages'][0].hasOwnProperty('code').should.equal(true);
      }));

    it('should return an error with an incorrect tenant', () => app
      .get('/api/1.0/languages/?tenant=not-real')
      .expect((res: SuperTest.Response) => {
        res.status.should.equal(500);
      }));
  });

});
