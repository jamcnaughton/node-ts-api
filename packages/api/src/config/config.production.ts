/**
 * @packageDocumentation
 * @module config
 */
import {IConfig} from './config.interface';

/**
 * An object containing the configuration settings for a production environment.
 */
export const config: IConfig = {
  cities: [
    {
      name: 'London',
      latitude: +process.env.LONDON_LAT,
      longitude: +process.env.LONDON_LONG
    }
  ],
  cors: {
    headers: process.env.CORS_HEADERS,
    methods: process.env.CORS_METHODS,
    origins: process.env.CORS_ORIGINS
  },
  externalApiUrl: process.env.EXTERNAL_API_URL,
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
