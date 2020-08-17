/**
 * @packageDocumentation
 * @module config
 */
import {IConfig} from './config.interface';

/**
 * An object containing the configuration settings for a development environment.
 */
export const config: IConfig = {
  cities: [
    {
      name: 'London',
      latitude: 51.509865,
      longitude: -0.118092
    }
  ],
  cors: {
    headers: 'Content-Type,Authorization,Origin',
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    origins: 'localhost'
  },
  externalApiUrl: 'https://bpdts-test-app.herokuapp.com'
};
