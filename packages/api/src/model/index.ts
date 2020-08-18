/**
 * @packageDocumentation
 * @module model
 */
import {ISequelizeConfig, Sequelize} from 'sequelize-typescript';
import {config} from '../config';
import {logService} from '../service/log';
import {DemoBackup} from './demo-backup';
import {Language} from './language';
import {Role} from './role';
import {Template} from './template';
import {TenantInfo} from './tenant-info';
import {Translation} from './translation';
import {User} from './user';
import {UserHasRole} from './user-has-role';

/**
 * Establish a sequelize object for interfacing with the database through.
 */
const sequelize: Sequelize = new Sequelize(<ISequelizeConfig>{
  ...config.sql,
  logging:
    process.env.NODE_ENV === 'test'
      ? false
      : (message: string) => logService.logger.log('debug', message),
});

// Add the models to sequelise.
sequelize.addModels([
  TenantInfo,
  DemoBackup,
  Template,
  Language,
  User,
  Role,
  Translation,
  UserHasRole
]);

// Make the sequelize object available.
export { sequelize, Sequelize };
