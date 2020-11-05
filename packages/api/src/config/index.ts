/**
 * @packageDocumentation
 * @module config
 */
import {config as developmentConfig} from './config.development';
import {IConfig} from './config.interface';
import {config as productionConfig} from './config.production';
import {config as testConfig} from './config.test';

/**
 * An object containing general configuration information.
 */
let config: IConfig;

// Get the environment specific general configuration information.
switch (process.env.NODE_ENV) {
case 'development':
  config = developmentConfig;
  break;
case 'test':
  config = testConfig;
  break;
default:
  config = productionConfig;
}

// Make the configuration object available.
export {config};
