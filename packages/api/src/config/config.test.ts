/**
 * @packageDocumentation
 * @module config
 */
import {IConfig} from './config.interface';

/**
 * An object containing the configuration settings for a test environment.
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
  externalApiUrl: 'https://test-external-api-host',
  redis: {
    host: '127.0.0.1',
    port: 6379
  },
  sql: {
    database: 'node-ts-api-dev',
    dialect: 'postgres',
    dialectOptions: {
      prependSearchPath: true,
      ssl: false
    },
    host: 'localhost',
    operatorsAliases: false,
    password: 'database-password',
    username: 'database-user',
    validateOnly: false
  },
  jwt: {
    duration: '60m',
    secret: '$fX$YV6xAwYdK^*h'
  }
};
