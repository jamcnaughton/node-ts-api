/**
 * @packageDocumentation
 * @module bin
 */
import * as express from 'express';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import fetch from 'node-fetch';
import 'reflect-metadata';
import {useExpressServer} from 'routing-controllers';
import {config} from '../config';
import {controllers} from '../endpoint';
import {authorisationUtility} from '../utilities/authorisation';
import {userUtility} from '../utilities/user';

// Ensure fetch is globally available (helps with mocking during tests).
declare var global: any;
global.fetch = fetch;

/**
 * Instance of NodeJS express service.
 */
const expressConfig: express.Application = express();

// Function for enacting CORS on requests.
const allowCrossDomain = function(_: any, res: any, next: any) {
  res.header('Access-Control-Allow-Origin', config.cors.origins);
  res.header('Access-Control-Allow-Methods', config.cors.methods);
  res.header('Access-Control-Allow-Headers', config.cors.headers);
  next();
};

// Set application to use several useful packages for handling security and cross-site requests.
expressConfig
  .use(
    morgan(
      'dev',
      {
        skip: (_, res) => {
          return process.env.NODE_ENV !== 'development' && res.statusCode < 400;
        }
      }
    )
  )
  .use(
    helmet()
  )
  .use(
    allowCrossDomain
  );

/**
 * The backend app as an express server passing in the relevant controllers.
 */
const app: express.Application = useExpressServer(
  expressConfig,
  {
    authorizationChecker: authorisationUtility,
    classTransformer: false,
    controllers: [
      ...controllers
    ],
    currentUserChecker: userUtility,
    development: process.env.NODE_ENV === 'development',
    routePrefix: '/api/1.0'
  }
);

// Make the app available.
export {app};
