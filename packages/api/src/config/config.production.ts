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
  externalApiUrl: process.env.EXTERNAL_API_URL
};
