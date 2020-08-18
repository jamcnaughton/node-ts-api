/**
 * @packageDocumentation
 * @module config
 */
import {IConfig} from './config.interface';

/**
 * An object containing the configuration settings for a development environment.
 */
export const config: IConfig = {
  accountSecurity: {
    attemptsLimit: 3,
    lockoutTime: 1800
  },
  cors: {
    headers: 'Content-Type,Authorization,Origin',
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    origins: 'localhost'
  },
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
