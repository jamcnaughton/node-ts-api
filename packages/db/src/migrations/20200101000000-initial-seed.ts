/**
 * @packageDocumentation
 * @module migrations
 */
import * as fs from 'fs';
import { QueryInterface, Sequelize } from 'sequelize';
import { v4 } from 'uuid';
import { DemoBackupHelper } from '../helpers/demo-backup.helper';
import { MigrationHelper } from '../helpers/migration.helper';
import { ITenantInfo, SeedHelper } from '../helpers/seed.helper';

/**
 * A change for the database.
 */
module.exports.up = async (queryInterface: QueryInterface, _: Sequelize, done: Function) => {

  // Create transaction.
  const transaction = await MigrationHelper.getSequelize().transaction();
  try {

    // Read tenants from seed-list.
    const tenantLoc = __dirname + '/../seeds/seed-list.json';
    const tenants: ITenantInfo[] = JSON.parse(fs.readFileSync(tenantLoc, 'utf8'));

  // Establish the tenant info model attributes.
    const tenantInfoAttributes = {
      id: {
        isUUID: 4,
        primaryKey: true,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID
      },
      schemaName: {
        validate: {
          notEmpty: true
        },
        type: Sequelize.STRING
      }
    };

    // Establish tenant info model in db.
    const tenantInfoModel = MigrationHelper.getSequelize().define(
      'TenantInfo',
      tenantInfoAttributes,
      {
        schema: 'public',
        freezeTableName: true,
        timestamps: false
      }
    );
    await (<any>tenantInfoModel).sync({transaction});

    // Loop through tenants to seed.
    for (const tenant of tenants) {

      // Set the helper's tenant.
      SeedHelper.setTenant(tenant.schemaName);

      // Create Schema.
      await queryInterface.createSchema(
        `"${tenant.schemaName}"`,
        {
          transaction
        }
      );

      // Set up tables.
      await SeedHelper.setupTables(transaction);

      // Populate relevant tables.
      await SeedHelper.populateTables(transaction);

      // Initialise the record in the tenant info table.
      await queryInterface.bulkInsert(
        'TenantInfo',
        [
          {
            id: tenant.id,
            schemaName: tenant.schemaName
          }
        ],
        {
          transaction
        }
      );

    }

    // Create table for storing stringified data in public schema.
    const demoBackupAttributes = {
      id: {
        isUUID: 4,
        primaryKey: true,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID
      },
      tableName: {
        validate: {
          notEmpty: true
        },
        type: Sequelize.STRING
      },
      position: {
        type: Sequelize.INTEGER
      },
      contents: {
        validate: {
          notEmpty: true
        },
        type: Sequelize.TEXT
      }
    };
    const demoBackupModel = MigrationHelper.getSequelize().define(
      'DemoBackup',
      demoBackupAttributes,
      {
        schema: 'public',
        freezeTableName: true,
        timestamps: false
      }
    );
    await (<any>demoBackupModel).sync({transaction});

    // Call demo tenant backup.
    await DemoBackupHelper.backup(transaction, queryInterface);

    // Create table for storing stringified data in public schema.
    const templateAttributes = {
      id: {
        isUUID: 4,
        primaryKey: true,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID
      },
      tableName: {
        validate: {
          notEmpty: true
        },
        type: Sequelize.STRING
      },
      timestamps: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      position: {
        type: Sequelize.INTEGER
      },
      definition: {
        validate: {
          notEmpty: true
        },
        type: Sequelize.TEXT
      }
    };
    const templateModel = MigrationHelper.getSequelize().define(
      'Template',
      templateAttributes,
      {
        schema: 'public',
        freezeTableName: true,
        timestamps: false
      }
    );
    await (<any>templateModel).sync({transaction});

    // Build the records of original templates.
    const modelListLoc = __dirname + '/../seeds/models/list.json';
    const modelList = JSON.parse(fs.readFileSync(modelListLoc, 'utf8'));
    const templateRecords = [];
    let i = 1;
    for (const modelListItem of modelList) {
      const attributes = require('./../seeds/models/defs/' + modelListItem.modelName + '.json');
      templateRecords.push(
        {
          id: v4(),
          tableName: modelListItem.tableName,
          timestamps: modelListItem.timestamps,
          position: i,
          definition: JSON.stringify(attributes)
        }
      );
      i++;
    }

    // Create the records for the original templates.
    await templateModel.bulkCreate(
      templateRecords,
      {
        transaction
      }
    );

    // Run the transaction.
    await transaction.commit();

    // Add tenants to redis.
    const tenantNames = tenants.map(
      tenant => tenant.schemaName
    );
    await SeedHelper.setRedisValues('tenants', tenantNames.join(','));

  // Rollback if needed.
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  // Complete migration.
  done();

};

/**
 * A rollback of a change for the database.
 */
module.exports.down = async (queryInterface: QueryInterface, _: Sequelize, done: Function) => {

  // Create transaction.
  const transaction = await MigrationHelper.getSequelize().transaction();
  try {

    // Read tenants from seed-list.
    const tenantLoc = __dirname + '/../seeds/seed-list.json';
    const tenants: ITenantInfo[] = JSON.parse(fs.readFileSync(tenantLoc, 'utf8'));

    // Destroy the demo backup table.
    queryInterface.dropTable(
      'DemoBackup',
      {
        transaction
      }
    );

    // Destroy the template table.
    queryInterface.dropTable(
      'Template',
      {
        transaction
      }
    );

    // Loop through tenants to remove.
    for (const tenant of tenants) {

      // Remove from the tenant info table
      await queryInterface.bulkDelete(
        'TenantInfo',
        {
          id: tenant.id
        },
        {
          transaction
        }
      );

      // Delete schema
      await queryInterface.dropSchema(
        `"${tenant.schemaName}"`,
        {
          transaction
        }
      );

    }

    // Destroy the tenant info table.
    queryInterface.dropTable(
      'TenantInfo',
      {
        transaction
      }
    );

    // Run the transaction.
    await transaction.commit();

    // Remove tenants from redis.
    await SeedHelper.delRedisValues('tenants');

  // Rollback if needed.
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  // Complete migration.
  done();

};

