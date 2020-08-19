// Imports.
const fs = require('fs');
const migrationHelper = require(__dirname + '/migration.helper.js');
const v4 = require('uuid/v4');

/**
 * The tenant being backed up.
 */
let tenant = 'demo';

/**
 * The list of table names (in order) to backup.
 */
module.exports.tableList = null;

/**
 * Restore the demo tenant.
 */
module.exports.backup = async (queryInterface) => {
	console.log('Backing up demo tenant...');

	// Get table names.
	const tableNames = [];
	if (this.tableList) {
		for (const table of this.tableList) {
			tableNames.push(table);
		}
	} else {
		const modelListLoc = __dirname + '/../seeds/models/list.json'
		modelList = JSON.parse(fs.readFileSync(modelListLoc, 'utf8'));
		for (const model of modelList) {
			tableNames.push(model['tableName']);
		}
	}

	// Read records from demo tenant.
	let position = 1;
	const backups = [];
	for (let i = 0; i < tableNames.length; i++) {

		// Get the table.
		const model = await migrationHelper.getTable(queryInterface, tableNames[i], tenant);

		// Get records from the table.
		const records = await model.findAll(
			{
				schema: tenant,
				logging: false
			}
		)
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
		)
		position++;

	}

	// Get backup table.
	const backupTableModel = await migrationHelper.getTable(queryInterface, 'DemoBackup', 'public');

	// Wipe backup table.
	await backupTableModel.destroy(
		{
			where: {},
			logging: false
		}
	);

	// Write records to backup table.
	await backupTableModel.bulkCreate(backups);


}

/**
 * Back up the demo tenant.
 */
module.exports.restore = async (queryInterface) => {
	console.log('Restoring demo tenant...');

	// Get backup table.
	const backupTableModel = await migrationHelper.getTable(queryInterface, 'DemoBackup', 'public');

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
		backups.push(backupRecord.dataValues)
		this.tableList.push(backupRecord.tableName);
	}

	// Get all the models.
	const models = [];
	for (let i = 0; i < backups.length ; i++) {
		const model = await migrationHelper.getTable(queryInterface, backups[i]['tableName'], tenant);
		models.push(model);
	}	

	// Clear the tables.
	for (let i = models.length - 1; i >= 0 ; i--) {
		await models[i].destroy(
			{
				where: {},
				searchPath: `"${tenant}"`,
				logging: false
			}
		);
	}

	// Write backup information into tables.
	for (let i = 0; i < backups.length ; i++) {
		const contents = JSON.parse(backups[i]['contents']);
		await models[i].bulkCreate(
			contents,
			{
				where: {},
				searchPath: `"${tenant}"`,
				logging: false
			}
		);
	}
	
}
