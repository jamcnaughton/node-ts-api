/**
 * @packageDocumentation
 * @module config
 */
import {IConfig} from './config.interface';

/**
 * An object containing the configuration settings for a production environment.
 */
export const config: IConfig = {
  accountSecurity: {
    attemptsLimit: +process.env.ACCOUNT_SECURITY_ATTEMPTS_LIMIT,
    lockoutTime: +process.env.ACCOUNT_SECURITY_LOCKOUT_TIME
  },
  cors: {
    headers: process.env.CORS_HEADERS,
    methods: process.env.CORS_METHODS,
    origins: process.env.CORS_ORIGINS
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT
  },
  sql: {
    database: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT,
    dialectOptions: {
      prependSearchPath: true,
      ssl: false
    },
    host: process.env.DB_HOST,
    operatorsAliases: false,
    password: process.env.DB_PASS,
    username: process.env.DB_USER,
    validateOnly: false
  },
  jwt: {
    duration: process.env.JWT_DURATION,
    secret: process.env.JWT_SECRET
  }
};
