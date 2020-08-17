import * as chai from 'chai';
import * as fetchMock from 'fetch-mock';
import {Server} from 'http';
import * as SuperTest from 'supertest';
import {server} from '../../../tools/test';
import {Person} from '../../model/person';

/**
 * Mock users to use in test data.
 */
const testPeople = [
  {
    id: 1,
    first_name: 'Test User A',
    last_name: 'Inside London',
    email: 'test-user-a@insider-london.co.uk',
    ip_address: '0.0.0.0',
    latitude: -6.5115909,
    longitude: 105.652983
  },
  {
    id: 2,
    first_name: 'Test User B',
    last_name: 'Near To London',
    email: 'test-user-b@near-to-london.co.uk',
    ip_address: '0.0.0.0',
    latitude: 51.509860,
    longitude: -0.118090
  },
  {
    id: 3,
    first_name: 'Test User C',
    last_name: 'Far From London',
    email: 'test-user-c@far-from-london.co.uk',
    ip_address: '0.0.0.0',
    latitude: 54.97328,
    longitude: -1.61396
  }
];

/**
 * The URL of this controller.
 */
const url = `/api/1.0/people`;

// Run tests for this controller.
describe(
  '/api/1.0/people',
  () => {

    // Establish the mock instance of the API.
    let app: SuperTest.SuperTest<SuperTest.Test>;
    let instance: Server;

    // To run before all tests.
    before(
      () => {
        instance = server();
        app = SuperTest(instance);
        fetchMock.mock(
          {
            name: 'city',
            matcher: 'https://test-external-api-host/city/London/users',
            method: 'GET',
            response: {
              status: 200,
              body: [testPeople[0]]
            }
          }
        );
        fetchMock.mock(
          {
            name: 'all',
            matcher: 'https://test-external-api-host/users',
            method: 'GET',
            response: {
              status: 200,
              body: testPeople
            }
          }
        );
      }
    );

    // To run after all tests.
    after(
      () => {
        instance.close();
      }
    );

    // To run after each test.
    afterEach(
      () => {
        fetchMock.resetHistory();
      }
    );

    // Run tests for the end httpGetNearCity endpoint.
    describe(
      `GET ${url} httpGetNearCity`,
      () => {

        // Establish test data for this end point.
        const testData = [
          {
            description: 'A request without a city.',
            expectation: 'City not supplied in request.',
            expectCode: 404,
            url: `${url}/near`
          },
          {
            description: 'A request without a valid city.',
            expectation: 'City supplied in request is not currently supported.',
            expectCode: 400,
            url: `${url}/near/Nottingham/within/50`
          },
          {
            description: 'A request without a distance.',
            expectation: 'Distance not supplied in request.',
            expectCode: 404,
            url: `${url}/near/London/within`
          },
          {
            description: 'A request without a valid distance.',
            expectation: 'Distance supplied in request is not a number.',
            expectCode: 400,
            url: `${url}/near/London/within/fifty`
          },
          {
            description: 'A valid request.',
            expectation: 'A list of people is returned',
            expectCode: 200,
            url: `${url}/near/London/within/50`,
            expectedResults: [testPeople[0], testPeople[1]]
          },
        ];

        // Loop through the test data.
        testData.forEach(
          (test) => {

            // Run tests for a a set of test data.
            describe(
              test.description,
              () => {

                // Test a query with the test data.
                it(
                  test.expectation,
                  async () => {

                    // Get response
                    const response = await app.get(test.url);

                    // Check that response code matches the expected return.
                    chai.expect(response.status).eq(test.expectCode);

                    // Additional tests for valid responses.
                    if (test.expectedResults) {

                      // Check calls to external API are made.
                      chai.expect(fetchMock.calls('city').length).eq(1);
                      chai.expect(fetchMock.calls('all').length).eq(1);

                      // Check end response is as expected.
                      chai.expect(response.body).haveOwnProperty('result');
                      chai.expect(response.body['result']).haveOwnProperty('people');
                      chai.expect(response.body['result']['people'].length).eq(test.expectedResults.length);

                      // Get comparable results.
                      const comparableResults: string[] = response.body['result']['people'].map(
                        (person: Person) => JSON.stringify(person)
                      );

                      // Check expected results are all present.
                      for (const result of test.expectedResults) {
                        chai.expect(comparableResults).contain(JSON.stringify(result));
                      }

                    }

                  }
                );

              }
            );

          }
        );

      }
    );

  }
);
