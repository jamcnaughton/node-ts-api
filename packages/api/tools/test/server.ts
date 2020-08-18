/**
 * @packageDocumentation
 * @module tools
 */
// tslint:disable no-console ter-max-len
import {join, resolve} from 'path';
import * as SuperTest from 'supertest';
import {app} from '../../src/bin';

export {redisService} from '../../src/service/redis';

/**
 * Function which performs an authorise call as a defined user.
 *
 * @param app The app to perform the authorise action in.
 * @param type The role of the user testing as.
 * @param emailAddress The e-mail address of the user testing as.
 * @param password The password of the user testing as.
 * @param tenant The tenant the user testing as belongs to.
 */
export const authorise = (
  testApp: SuperTest.SuperTest<SuperTest.Test>,
  type: string,
  emailAddress: string,
  password: string,
  tenant: string = 'demo'
): SuperTest.Test => testApp.post(`/api/1.0/auth`)
.send(
  {
    email: emailAddress,
    password: password,
    role: type,
    tenant: tenant,
    frontend: true
  }
);

/**
 * A function which creates a server instance running the app.
 */
export const server: Function = () => {

  // Set a port to run the server on.
  const port: number = +process.env.PORT || 8080;

  // Start the app.
  return app.listen(
    port,
    () => console.log(`Test server started on port ${port}`)
  );

};

/**
 * Function which makes an upload call.
 *
 * @param filename The file to upload.
 */
export const upload: Function = (filename: string): string => resolve(join(__dirname, '../uploads', filename));
