// Imports.
const demoHelper = require(__dirname + '/../helpers/demo-backup.helper.js');
const migrationHelper = require(__dirname + '/../helpers/migration.helper.js');
const seedHelper = require(__dirname + '/../helpers/seed.helper.js');

// Use the following command to generate a migration with the correct name:
// npm run db:migrate:gen

// Another useful command for restarting the db from scratch:
// npm run db:wipe:dev && npm run db:migrate

/**
 * A change for the database.
 */
module.exports.up = async (queryInterface, Sequelize, done) => {

  // Create transaction.
  const t = await migrationHelper.getSequelise().transaction();
  try {

    // Run restore of demo tenant.
    await demoHelper.restore(queryInterface);

    // This is where the migration magic would usually happen.
  
    // Get all tenants.
    const tenants = await queryInterface.showAllSchemas();

    // Get a table.
    const tableModel = await migrationHelper.getTable(queryInterface, 'TableName', targetTenant);

    // Add a column.
    await migrationHelper.addColumn(
      queryInterface,
      'TableName',
      'ColumnName',
      columnAttributesObject,
      arrayOfTargetTenants
    );

    // Remove a column.
    await migrationHelper.removeColumn(
      queryInterface,
      'TableName',
      'ColumnName',
      arrayOfTargetTenants
    );

    // Create a table.
    const tableModel = await migrationHelper.addTableToTenants(
      queryInterface,
      'TableName',
      tableAttributeModel,
      arrayOfTargetTenants,
      'TableToAddAfterInList'
    );

    // Remove a table.
    await migrationHelper.removeTableFromTenants(
      queryInterface,
      'TableName',
      arrayOfTargetTenants
    );

    // Add translations.
    await migrationHelper.addTranslations(
      queryInterface,
      nestedTranslationsObject,
      arrayOfTargetTenants
    );

    // Get array of translation keys from nested translations object.    
    const arrayOfTranslationKeys = migrationHelper.getTranslationKeys(nestedTranslationsObject);

    // Remove translations.
    await migrationHelper.removeTranslations(
      queryInterface,
      arrayOfTranslationKeys,
      arrayOfTargetTenants
    );

    // Run the transaction.
    await t.commit();

    // Run backup of demo tenant.
    await demoHelper.backup(queryInterface);

  // Rollback if needed.
  } catch (error) {
    await t.rollback();
    throw error;
  }

  // Complete migration.
  done();

};

/**
* A rollback of a change for the database.
*/
module.exports.down = async (queryInterface, Sequelize, done) => {

  // Create transaction.
  const t = await migrationHelper.getSequelise().transaction();
  try {

    // Run restore of demo tenant.
    await demoHelper.restore(queryInterface);

    // This is where the migration undo-ing magic would usually happen.

    // Run the transaction.
    await t.commit();

    // Run backup of demo tenant.
    await demoHelper.backup(queryInterface);  

    // Rollback if needed.
  } catch (error) {
    await t.rollback();
    throw error;
  }

  // Complete migration.
  done();

};

