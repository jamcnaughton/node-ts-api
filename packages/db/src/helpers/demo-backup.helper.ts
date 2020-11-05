/**
 * @packageDocumentation
 * @module migrations
 */
import * as fs from 'fs';
import { QueryInterface, Transaction } from 'sequelize';
import { v4 } from 'uuid';
import { MigrationHelper } from './migration.helper';
import { SeedHelper } from './seed.helper';

/**
 * Class which helps with demo tenant backups.
 */
export class DemoBackupHelper {

  /**
   * The tenant being backed up.
   */
  private static demoTenant = 'demo';

  /**
   * The list of table names (in order) to backup.
   */
  public static tableList: string[] = null;

  /**
   * Restore the demo tenant.
   *
   * @param transaction The transaction object.
   * @param queryInterface The query interface object.
   */
  public static async backup (transaction: Transaction, queryInterface: QueryInterface) {
    console.log('Backing up demo tenant...');

    // Get table names.
    const tableNames = [];
    if (this.tableList) {
      for (const table of this.tableList) {
        tableNames.push(table);
      }
    } else {
      const modelListLoc = __dirname + '/../seeds/models/list.json';
      SeedHelper.modelList = JSON.parse(fs.readFileSync(modelListLoc, 'utf8'));
      for (const model of SeedHelper.modelList) {
        tableNames.push(model['tableName']);
      }
    }

    // Read records from demo tenant.
    let position = 1;
    const backups = [];
    for (let i = 0; i < tableNames.length; i++) {

      // Get the table.
      const model = await MigrationHelper.getTable(transaction, queryInterface, tableNames[i], DemoBackupHelper.demoTenant);

      // Get records from the table.
      const records = await model.findAll(
        {
          searchPath: `"${DemoBackupHelper.demoTenant}"`,
          logging: false,
          transaction
        }
      );
      const contents = [];
      for (const record of records) {
        contents.push(record.dataValues);
      }

      // Create the backup record.
      backups.push(
        {
          id: v4(),
          position: position,
          tableName: tableNames[i],
          contents: JSON.stringify(contents)
        }
      );
      position++;

    }

    // Get backup table.
    const backupTableModel = await MigrationHelper.getTable(transaction, queryInterface, 'DemoBackup', 'public');

    // Wipe backup table.
    await backupTableModel.destroy(
      {
        where: {},
        logging: false,
        transaction
      }
    );

    // Write records to backup table.
    await backupTableModel.bulkCreate(
      backups,
      {
        transaction
      }
    );

  }

  /**
   * Restore the demo tenant.
   *
   * @param transaction The transaction object.
   * @param queryInterface The query interface object.
   */
  public static async restore (transaction: Transaction, queryInterface: QueryInterface) {
    console.log('Restoring demo tenant...');

    // Get backup table.
    const backupTableModel = await MigrationHelper.getTable(transaction, queryInterface, 'DemoBackup', 'public');

    // Get contents from backups (in order).
    const backupRecords = await backupTableModel.findAll(
      {
        order: [
          ['position', 'ASC']
        ],
        logging: false
      }
    );
    const backups = [];
    this.tableList = [];
    for (const backupRecord of backupRecords) {
      backups.push(backupRecord.dataValues);
      this.tableList.push(backupRecord.tableName);
    }

    // Get all the models.
    const models = [];
    for (let i = 0; i < backups.length ; i++) {
      const model = await MigrationHelper.getTable(transaction, queryInterface, backups[i]['tableName'], DemoBackupHelper.demoTenant);
      models.push(model);
    }

    // Clear the tables.
    for (let i = models.length - 1; i >= 0 ; i--) {
      await models[i].destroy(
        {
          where: {},
          searchPath: `"${DemoBackupHelper.demoTenant}"`,
          logging: false,
          transaction
        }
      );
    }

    // Write backup information into tables.
    for (let i = 0; i < backups.length ; i++) {
      const contents = JSON.parse(backups[i]['contents']);
      await models[i].bulkCreate(
        contents,
        {
          searchPath: `"${DemoBackupHelper.demoTenant}"`,
          logging: false,
          transaction
        }
      );
    }

  }

}
