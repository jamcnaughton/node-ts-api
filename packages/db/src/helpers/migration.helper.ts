/**
 * @packageDocumentation
 * @module migrations
 */
import * as fs from 'fs';
import { DefineModelAttributes, Model, QueryInterface, Sequelize, Transaction } from 'sequelize';
import { v4 } from 'uuid';
import { DemoBackupHelper } from './demo-backup.helper';

/**
 * Class which helps with database migrations.
 */
export class MigrationHelper {

  /**
   * The sequelize client.
   */
  public static sequelizeClient: Sequelize = null;

  /**
   * Create a sequelize object hooked up to the right database.
   *
   * @returns The sequelize object.
   */
  public static getSequelize(): Sequelize {
    if (MigrationHelper.sequelizeClient === null) {
      const env = process.env.NODE_ENV || 'development';
      const config = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf8'))[env];
      MigrationHelper.sequelizeClient = new Sequelize(config.database, config.username, config.password, config);
    }
    return MigrationHelper.sequelizeClient;
  }

  /**
   * Get all the tenant names that currently exist in the database.
   *
   * @param transaction The transaction object.
   * @param queryInterface The query interface object.
   * @returns An array of tenant names.
   */
  public static async getTenants(transaction: Transaction, queryInterface: QueryInterface): Promise<string[]> {
    return <string[]>await queryInterface.showAllSchemas({transaction});
  }

  /**
   * Get the sequelize model for an existing table.
   *
   * @param transaction The transaction object.
   * @param queryInterface The query interface object.
   * @param tableName The name of the table.
   * @param tenant The tenant to change the table in.
   * @returns An established model for the table.
   */
  public static async getTable (
    transaction: Transaction,
    queryInterface: QueryInterface,
    tableName: string,
    tenant: string
  ): Promise<Model<any, any, any>> {

    // Get attributes from sequelize.
    let attributes = await queryInterface.describeTable(
      {
        tableName: tableName,
        schema: tenant
      },
      <any>({
        logging: false,
        transaction
      })
    );
    let timestamps = false;

    // Get attributes from template table if template table is present and not in the public schema.
    if (tenant !== 'public') {
      const publicTableNames = await queryInterface.showAllTables();
      if (publicTableNames.indexOf('Template') > -1) {
        const templateTable = await this.getTable(transaction, queryInterface, 'Template', 'public');
        const templateRecord = await templateTable.findOne(
          {
            where: {
              tableName: tableName
            },
            logging: false,
            transaction
          }
        );
        if (templateRecord) {
          attributes = JSON.parse(templateRecord.definition);
          timestamps = templateRecord.timestamps;
          MigrationHelper.update(attributes, tenant);
        }
      }
    }

    // Instantiate the model.
    const model = await MigrationHelper.getSequelize().define(
      tableName,
      <DefineModelAttributes<any>>attributes,
      {
        schema: tenant,
        freezeTableName: true,
        timestamps: timestamps
      }
    );
    await (<any>model).sync({transaction});
    return <Model<any, any, any>>model;

  }

  /**
  * Recursive function for flattening a JSON object.
  *
  * @param object The object to get the values from.
  * @param target The object to put the resulting keys and values into.
  * @param path  The current location in original object.
  */
  public static flattenJson (object: {}, target: {}, path = ''): void {
    const join = path === '' ? '' : '.';
    for (const key of Object.keys(object)) {
      if (object[key] && typeof object[key] === 'object') {
        this.flattenJson(object[key], target, `${path}${join}${key}`);
      } else {
        target[`${path}${join}${key}`] = object[key];
      }
    }
  }

  /**
  * Flattens a JSON object then returns just the keys.
  *
  * @param translations The object to get the translation keys from.
  * @returns The array of keys.
  */
  public static getTranslationKeys (translations: {}): string[] {
    const flatTranslations = {};
    this.flattenJson(translations, flatTranslations);
    return Object.keys(flatTranslations);
  }

  /**
   * Add translations (of a specific prefix type) to translations table(s).
   *
   * @param transaction The transaction object.
   * @param queryInterface The query interface object.
   * @param translations The multi-dimensional object containing translations.
   * @param tenants An array of the tenants to add the translations to.
   * @param languages The specific languages to create the translations for if known.
   */
  public static async addTranslations (
    transaction: Transaction,
    queryInterface: QueryInterface,
    translations: {},
    tenants: string[],
    languageIds: string[] = []
  ) {

    // Loop through tenants.
    await MigrationHelper.forAllTenants(
      tenants,
      async (tenant: string) => {

        // Get available language IDs for tenant.
        if (languageIds.length === 0) {
          const languageModel = await this.getTable(transaction, queryInterface, 'Language', tenant);
          const languages = await languageModel.findAll(
            {
              attributes: [
                'id'
              ],
              searchPath: `"${tenant}"`,
              logging: false,
              transaction
            }
          );
          for (const language of languages) {
            languageIds.push(language.id);
          }
        }

        // Flatten translation object.
        const flattenedTranslations: string[] = [];
        this.flattenJson(translations, flattenedTranslations);

        // Create translation records.
        const translationRecords = [];
        for (const translationKey of Object.keys(flattenedTranslations)) {
          const prefix = translationKey.split('.')[0];
          const frontendSignIn = prefix === 'frontend-sign-in';
          const frontendTenant = prefix === 'frontend-tenant';
          for (const languageId of languageIds) {
            translationRecords.push(
              {
                id: v4(),
                data: flattenedTranslations[translationKey],
                languageId: languageId,
                translationKey: translationKey,
                frontendSignIn: frontendSignIn,
                frontendTenant: frontendTenant
              }
            );
          }
        }

        // Add translations to table.
        const translationModel = await this.getTable(transaction, queryInterface, 'Translation', tenant);
        await translationModel.bulkCreate(
          translationRecords,
          {
            searchPath: `"${tenant}"`,
            logging: false,
            transaction
          }
        );

      }
    );

  }

  /**
   * Remove translations from Translation table(s).
   *
   * @param transaction The transaction object.
   * @param queryInterface The query interface object.
   * @param translationKeys The keys of the translations to delete.
   * @param tenants An array of the tenants to remove the translations from.
   */
  public static async removeTranslations (
    transaction: Transaction,
    queryInterface: QueryInterface,
    translationKeys: string[],
    tenants: string[]
  ) {

    // Loop through tenants.
    await MigrationHelper.forAllTenants(
      tenants,
      async (tenant: string) => {

        // Remove translations from table.
        const translationModel = await this.getTable(transaction, queryInterface, 'Translation', tenant);
        await translationModel.destroy(
          {
            where: {
              translationKey: translationKeys
            },
            searchPath: `"${tenant}"`,
            logging: false,
            transaction
          }
        );

      }
    );

  }

  /**
   * Create a new table in the tenant schemas.
   *
   * @param transaction The transaction object.
   * @param queryInterface The query interface object.
   * @param tableName The name of the table to be created.
   * @param tableAttributes The attributes of the table to be created.
   * @param tenants The tenants to create the table in.
   * @param insertAfter The name of the table to insert the new table after (inserts at the start if null).
   * @param timestamps Flag indicating whether to include time stamps in the table.
   * @returns The defined tables.
   */
  public static async addTableToTenants (
    transaction: Transaction,
    queryInterface: QueryInterface,
    tableName: string,
    tableAttributes: {},
    tenants: string[],
    insertAfter: string,
    timestamps = false
  ) {

    // Establish tenant-indexed array of tables to create.
    const models: Model<unknown, unknown, any>[] = [];

    // Use query interface to create the table.
    if (tenants) {
      await MigrationHelper.forAllTenants(
        tenants,
        async (tenant: string) => {
          const attributesClone = JSON.parse(JSON.stringify(tableAttributes));
          MigrationHelper.update(attributesClone, tenant);
          const model = MigrationHelper.getSequelize().define(
            tableName,
            attributesClone,
            {
              schema: tenant,
              freezeTableName: true,
              timestamps: timestamps
            }
          );
          await (<any>model).sync({transaction});
          models[tenant] = model;
        }
      );
    }

    // Get names of tables in public schema.
    const publicTableNames = await queryInterface.showAllTables({transaction});

    // Update the template table.
    if (publicTableNames.indexOf('Template') > -1) {

      // Get position in list.
      const templateModel = await this.getTable(transaction, queryInterface, 'Template', 'public');
      let insertAfterPos = 0;
      if (insertAfter) {
        const insertAfterRecord = await templateModel.findOne(
          {
            where: {
              tableName: insertAfter
            },
            logging: false,
            transaction
          }
        );
        insertAfterPos = insertAfterRecord.position;
      }

      // Increment all following records' position.
      await templateModel.update(
        {
          position: Sequelize.literal('position + 1')
        },
        {
          where: {
            position: {
              [Sequelize.Op.gt]: insertAfterPos
            }
          },
          logging: false,
          transaction
        }
      );

      // Insert new record.
      await templateModel.create(
        {
          id: v4(),
          tableName: tableName,
          position: insertAfterPos + 1,
          timestamps: timestamps,
          definition: JSON.stringify(tableAttributes)
        },
        {
          logging: false,
          transaction
        }
      );

    }

    // Update the demo list.
    if (publicTableNames.indexOf('DemoBackup') > -1) {
      if (tenants) {
        const newTableList = [];
        for (const tableListName of DemoBackupHelper.tableList) {
          newTableList.push(tableListName);
          if (tableListName === insertAfter) {
            newTableList.push(tableName);
          }
        }
        DemoBackupHelper.tableList = newTableList;
      }
    }

    // Return the established models.
    return models;

  }

  /**
   * Remove table in the tenant schemas.
   *
   * @param transaction The transaction object.
   * @param queryInterface The query interface object.
   * @param tableName The name of the table to be remove.
   * @param tenants The tenants to remove the table in.
   */
  public static async removeTableFromTenants (
    transaction: Transaction,
    queryInterface: QueryInterface,
    tableName: string,
    tenants: string[]
  ) {

    // Use query interface to remove the table.
    if (tenants) {
      await MigrationHelper.forAllTenants(
        tenants,
        async (tenant: string) => {
          await queryInterface.dropTable(
            tableName,
            {
              searchPath: `"${tenant}"`,
              logging: false,
              transaction
            }
          );
        }
      );
    }

    // Get names of tables in public schema.
    const publicTableNames = await queryInterface.showAllTables({transaction});

    // Update the template table.
    if (publicTableNames.indexOf('Template') > -1) {

      // Get position in list.
      const templateModel = await this.getTable(transaction, queryInterface, 'Template', 'public');
      const toRemoveRecord = await templateModel.findOne(
        {
          where: {
            tableName: tableName
          },
          logging: false,
          transaction
        }
      );
      const toRemovePos = toRemoveRecord.position;

      // Decrement all following records' position.
      await templateModel.update(
        {
          position: Sequelize.literal('position - 1')
        },
        {
          where:  {
            position: {
              [Sequelize.Op.gt]: toRemovePos
            }
          },
          logging: false,
          transaction
        }
      );

      // Remove record.
      await templateModel.destroy(
        {
          where: {
            tableName: tableName
          },
          logging: false,
          transaction
        }
      );

    }

    // Update the demo list.
    if (publicTableNames.indexOf('DemoBackup') > -1) {
      if (tenants) {
        if (DemoBackupHelper.tableList) {
          const newTableList = [];
          for (const tableListName of DemoBackupHelper.tableList) {
            if (tableListName !== tableName) {
              newTableList.push(tableListName);
            }
          }
          DemoBackupHelper.tableList = newTableList;
        }
      }
    }

  }

  /**
   * Add a column to a table in the tenant schemas.
   *
   * @param transaction The transaction object.
   * @param queryInterface The query interface object.
   * @param tableName The name of the table to have the column added to.
   * @param columnName The name of the column to add.
   * @param columnAttributes The attributes of the column to add.
   * @param tenants The tenants to add the column in.
   */
  public static async addColumn (
    transaction: Transaction,
    queryInterface: QueryInterface,
    tableName: string,
    columnName: string,
    columnAttributes: {},
    tenants: string[]
  ) {

    // Use query interface to remove the table.
    if (tenants) {
      await MigrationHelper.forAllTenants(
        tenants,
        async (tenant: string) => {
          const attributesClone = JSON.parse(JSON.stringify(columnAttributes));
          MigrationHelper.update(attributesClone, tenant);
          await queryInterface.addColumn(
            {
              schema: tenant,
              tableName: tableName
            },
            columnName,
            attributesClone,
            {
              transaction
            }
          );
        }
      );
    }

    // Get names of tables in public schema.
    const publicTableNames = await queryInterface.showAllTables({transaction});

    // Update the template table.
    if (publicTableNames.indexOf('Template') > -1) {

      // Get current template record for target table.
      const templateModel = await this.getTable(transaction, queryInterface, 'Template', 'public');
      const toModifyRecord = await templateModel.findOne(
        {
          where: {
            tableName: tableName
          },
          logging: false,
          transaction
        }
      );
      const tableAttributes = JSON.parse(toModifyRecord.definition);

      // Modify the definition to include the new column.
      tableAttributes[columnName] = columnAttributes;

      // Update the record.
      await templateModel.update(
        {
          definition: JSON.stringify(tableAttributes)
        },
        {
          where:  {
            tableName: tableName
          },
          logging: false,
          transaction
        }
      );

    }

  }

  /**
   * Remove a column from a table in the tenant schemas.
   *
   * @param transaction The transaction object.
   * @param queryInterface The query interface object.
   * @param tableName The name of the table to have the column removed from.
   * @param columnName The name of the column to remove.
   * @param tenants The tenants to add the column in.
   */
  public static async removeColumn (
    transaction: Transaction,
    queryInterface: QueryInterface,
    tableName: string,
    columnName: string,
    tenants: string[]
  ) {

    // Use query interface to remove the table.
    if (tenants) {
      await MigrationHelper.forAllTenants(
        tenants,
        async (tenant: string) => {
          await queryInterface.removeColumn(
            {
              schema: tenant,
              tableName: tableName
            },
            columnName,
            {
              transaction
            }
          );
        }
      );
    }

    // Get names of tables in public schema.
    const publicTableNames = await queryInterface.showAllTables({transaction});

    // Update the template table.
    if (publicTableNames.indexOf('Template') > -1) {

      // Get current template record for target table.
      const templateModel = await this.getTable(transaction, queryInterface, 'Template', 'public');
      const toModifyRecord = await templateModel.findOne(
        {
          where: {
            tableName: tableName
          },
          logging: false,
          transaction
        }
      );
      const tableAttributes = JSON.parse(toModifyRecord.definition);

      // Modify the definition to remove the column.
      delete tableAttributes[columnName];

      // Update the record.
      await templateModel.update(
        {
          definition: JSON.stringify(tableAttributes)
        },
        {
          where:  {
            tableName: tableName
          },
          logging: false,
          transaction
        }
      );

    }

  }

  /**
   * Get a model definition from a file and substitute in the correct values.
   *
   * @param fileName The name of the file to get the definition from.
   * @param tenant The tenant the schema should belong to.
   * @returns The definition object.
   */
  public static getDefinitionFromFile = (fileName: string, tenant: string) => {
    const attributes = require('./../seeds/models/defs/' + fileName + '.json');
    return MigrationHelper.processAttributes(attributes, tenant);
  }

  /**
   * Substitute in the correct values for attributes.
   *
   * @param attributes The name of the file to get the definition from.
   * @param tenant The tenant the schema should belong to.
   * @returns The definition object.
   */
  public static processAttributes (attributes: {}, tenant: string) {
    const attributesClone = JSON.parse(JSON.stringify(attributes));
    MigrationHelper.update(attributesClone, tenant);
    return attributesClone;
  }

  /**
   * Perform actions for each tenant asychronously.
   *
   * @param tenants The array of tenants.
   * @param func The function to execute.
   */
  public static async forAllTenants(tenants: string[], func: Function) {

    // Loop through tenants.
    const promises: Promise<void>[] = [];
    for (const tenant of tenants) {
      promises.push(
        Promise.resolve()
        .then(
          async () => {
            await func(tenant);
          }
        )
      );

    }

    // Execute promises.
    await Promise.all(promises);

  }

  /**
   * A recursive function for substituting values in a nested object.
   *
   * @param object The object to replace values in.
   * @param tenant The tenant to replace some values with.
   */
  private static update (object: {}, tenant: string) {
      Object.keys(object).forEach(
      (key) => {
        if (object[key] && typeof object[key] === 'object') {
          return MigrationHelper.update(object[key], tenant);
        }
        if (typeof object[key] === 'string') {
          if (object[key] === '{{TENANT}}') {
            object[key] = tenant;
          } else if (object[key] === '{{NEW_DATE}}') {
            object[key] = new Date();
          } else if (object[key] === '{{NEW_DATE_PLUS_SIX_MONTHS}}') {
            object[key] = new Date().setMonth(new Date().getMonth() + 6);
          } else if (object[key].includes('{{Sequelize.')) {
            const type = object[key].split('.')[1].replace('}}', '');
            object[key] = Sequelize[type];
          }
        }
      }
    );
  }

}
