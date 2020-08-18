// TODO Feature: Make migrations use TS

// TODO Feature: Make migrations use promises

// TODO Feature: Put all changes to db in transactions.

// Imports.
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const demoBackupHelper = require(__dirname + '/demo-backup.helper.js');
const Sequelize = require('sequelize');
const v4 = require('uuid/v4');
const config = JSON.parse(fs.readFileSync(__dirname + '/../../config.json', 'utf8'))[env];

/**
 * The sequelise client.
 */
let sequeliseClient = null;

/**
 * Create a sequelise object hooked up to the right database.
 * 
 * @returns The sequelise object.
 */
module.exports.getSequelise = () => {
	if (sequeliseClient === null) {
		sequeliseClient = new Sequelize(config.database, config.username, config.password, config);
	}
	return sequeliseClient;
}

/**
 * Get the Sequelise model for an existing table.
 *
 * @param queryInterface The query interface object.
 * @param tableName The name of the table.
 * @param tenant The tenant to change the table in.
 * @returns An established model for the table.
 */
module.exports.getTable = async (queryInterface, tableName, tenant) => {

	// Get attributes from sequelise.
	let attributes = await queryInterface.describeTable(
		{
			tableName: tableName,
			schema: tenant,
			logging: false
		}
	);
	let timestamps = false;

	// Get attributes from template table if template table is present and not in the public schema.
	if (tenant !== 'public') {
		const publicTableNames = await queryInterface.showAllTables();
		if (publicTableNames.indexOf('Template') > -1) {
			const templateTable = await this.getTable(queryInterface, 'Template', 'public');
			const templateRecord = await templateTable.findOne(
				{
					where: {
						tableName: tableName
					},
					logging: false
				}
			);
			if (templateRecord) {
				attributes = JSON.parse(templateRecord.definition);
				timestamps = templateRecord.timestamps;
				update(attributes, tenant);
			}
		}
	}

	// Instantiate the model.
	const model = await this.getSequelise().define(
		tableName,
		attributes,
		{
			schema: tenant,
			freezeTableName: true,
			timestamps: timestamps,
			logging: false
		}
	);
	await model.sync();
	return model;

}

/**
* Recursive function for flattening a JSON object.
*
* @param object The object to get the values from.
* @param target The object to put the resulting keys and values into.
* @param path	The current location in original object.
*/
module.exports.flattenJson = (object, target, path = '') => {
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
module.exports.getTranslationKeys = (translations) => {
	const flatTranslations = {};
	this.flattenJson(translations, flatTranslations);
	return Object.keys(flatTranslations);
}

/**
 * Add translations (of a specific prefix type) to translations table(s).
 * 
 * @param queryInterface The query interface object.
 * @param translations The multi-dimensional object containing translations.
 * @param tenants An array of the tenants to add the translations to.
 * @param languages The specific languages to create the translations for if known.
 */
module.exports.addTranslations = async (queryInterface, translations, tenants, languageIds = []) => {

	// Loop through tenants.
	for (const tenant of tenants) {

		// Get available language IDs for tenant.
		if (languageIds.length === 0) {
			const languageModel = await this.getTable(queryInterface, 'Language', tenant);
			const languages = await languageModel.findAll(
				{
					attributes: [
						'id'
					],
					searchPath: `"${tenant}"`,
					logging: false
				}
			);
			for (const language of languages) {
				languageIds.push(language.id);
			}
		}

		// Flatten translation object.
		const flattenedTranslations = [];
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
		const translationModel = await this.getTable(queryInterface, 'Translation', tenant);
		await translationModel.bulkCreate(
			translationRecords,
			{
				searchPath: `"${tenant}"`,
				logging: false
			}
		);

	}

}

/**
 * Remove translations from Translation table(s).
 * 
 * @param queryInterface The query interface object.
 * @param translationKeys The keys of the translations to delete.
 * @param tenants An array of the tenants to remove the translations from.
 */
module.exports.removeTranslations = async (queryInterface, translationKeys, tenants) => {

	// Loop through tenants.
	for (const tenant of tenants) {

		// Remove translations from table.
		const translationModel = await this.getTable(queryInterface, 'Translation', tenant);
		await translationModel.destroy(
			{
				where: {
					translationKey: translationKeys
				},
				searchPath: `"${tenant}"`,
				logging: false
			}
		);

	}

}

/**
 * Create a new table in the tenant schemas.
 * 
 * @param queryInterface The query interface object.
 * @param tableName The name of the table to be created.
 * @param tableAttributes The attributes of the table to be created.
 * @param tenants The tenants to create the table in.
 * @param insertAfter The name of the table to insert the new table after (inserts at the start if null).
 * @param timestamps Flag indicating whether to include time stamps in the table.
 * @returns The defined tables.
 */
module.exports.addTableToTenants = async (
	queryInterface,
	tableName,
	tableAttributes,
	tenants,
	insertAfter,
	timestamps = false
) => {

	// Establish tenant-indexed array of tables to create.
	const models = [];
	
	// Use query interface to create the table.
	if (tenants) {
		for (const tenant of tenants) {
			const attributesClone = JSON.parse(JSON.stringify(tableAttributes));
			update(attributesClone, tenant);
			const model = this.getSequelise().define(
				tableName,
				attributesClone,
				{
					schema: tenant,
					freezeTableName: true,
					timestamps: timestamps,
					logging: false
				}
			);
			await model.sync();
			models[tenant] = model;
		}
	}

	// Get names of tables in public schema.
	const publicTableNames = await queryInterface.showAllTables();

	// Update the template table.
	if (publicTableNames.indexOf('Template') > -1) {

		// Get position in list.
		const templateModel = await this.getTable(queryInterface, 'Template', 'public');
		let insertAfterPos = 0;
		if (insertAfter) {
			const insertAfterRecord = await templateModel.findOne(
				{
					where: {
						tableName: insertAfter
					},
					logging: false
				}
			);
			insertAfterPos = insertAfterRecord.position;
		}

		// Increment all following records' position.
		await templateModel.increment(
			'position',
			{
				where:  {
					position: {
						[Sequelize.Op.gt]: insertAfterPos
					}
				},
				logging: false
			}
		);

		// Insert new record.
		await templateModel.create(
			{
				id: v4(),
				tableName: tableName,
				position: insertAfterPos + 1,
				timestamps: timestamps,
				definition: JSON.stringify(tableAttributes),
				logging: false
			}
		);

	}
	
	// Update the demo list.
	if (publicTableNames.indexOf('DemoBackup') > -1) {
		if (tenants) {
			const newTableList = [];
			for (const tableListName of demoBackupHelper.tableList) {
				newTableList.push(tableListName);
				if (tableListName === insertAfter) {
					newTableList.push(tableName);
				}
			}
			demoBackupHelper.tableList = newTableList;
		}
	}

	// Return the established models.
	return models;

}

/**
 * Remove table in the tenant schemas.
 * 
 * @param queryInterface The query interface object.
 * @param tableName The name of the table to be remove.
 * @param tenants The tenants to remove the table in.
 */
module.exports.removeTableFromTenants = async (
	queryInterface,
	tableName,
	tenants
) => {

	// Use query interface to remove the table.
	if (tenants) {
		for (const tenant of tenants) {
			await queryInterface.dropTable(
				{
					tableName: tableName,
					schema: tenant,
					logging: false
				}
			);
		}
	}

	// Get names of tables in public schema.
	const publicTableNames = await queryInterface.showAllTables();

	// Update the template table.
	if (publicTableNames.indexOf('Template') > -1) {

		// Get position in list.
		const templateModel = await this.getTable(queryInterface, 'Template', 'public');
		const toRemoveRecord = await templateModel.findOne(
			{
				where: {
					tableName: tableName
				},
				logging: false
			}
		);
		const toRemovePos = toRemoveRecord.position;

		// Decrement all following records' position.
		await templateModel.decrement(
			'position',
			{
				where:  {
					position: {
						[Sequelize.Op.gt]: toRemovePos
					}
				},
				logging: false
			}
		);

		// Remove record.
		await templateModel.destroy(
			{
				where: {
					tableName: tableName
				},
				logging: false
			}
		);

	}
	
	// Update the demo list.
	if (publicTableNames.indexOf('DemoBackup') > -1) {
		if (tenants) {
			if (demoBackupHelper.tableList) {
				const newTableList = [];
				for (const tableListName of demoBackupHelper.tableList) {
					if (tableListName !== tableName) {
						newTableList.push(tableListName);
					}
				}
				demoBackupHelper.tableList = newTableList;
			}
		}
	}

}

/**
 * Add a column to a table in the tenant schemas.
 * 
 * @param queryInterface The query interface object.
 * @param tableName The name of the table to have the column added to.
 * @param columnName The name of the column to add.
 * @param columnAttributes The attributes of the column to add.
 * @param tenants The tenants to add the column in.
 */
module.exports.addColumn = async (
	queryInterface,
	tableName,
	columnName,
	columnAttributes,
	tenants
) => {

	// Use query interface to remove the table.
	if (tenants) {
		for (const tenant of tenants) {
			const attributesClone = JSON.parse(JSON.stringify(columnAttributes));
			update(attributesClone, tenant);
			await queryInterface.addColumn(
				{
					schema: tenant,
					tableName: tableName,
					logging: false
				},
				columnName,
				attributesClone
			);
		}
	}

	// Get names of tables in public schema.
	const publicTableNames = await queryInterface.showAllTables();

	// Update the template table.
	if (publicTableNames.indexOf('Template') > -1) {

		// Get current template record for target table.
		const templateModel = await this.getTable(queryInterface, 'Template', 'public');
		const toModifyRecord = await templateModel.findOne(
			{
				where: {
					tableName: tableName
				},
				logging: false
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
				logging: false
			}
		);

	}

}

/**
 * Remove a column from a table in the tenant schemas.
 * 
 * @param queryInterface The query interface object.
 * @param tableName The name of the table to have the column removed from.
 * @param columnName The name of the column to remove.
 * @param tenants The tenants to add the column in.
 */
module.exports.removeColumn = async (
	queryInterface,
	tableName,
	columnName,
	tenants
) => {

	// Use query interface to remove the table.
	if (tenants) {
		for (const tenant of tenants) {
			await queryInterface.removeColumn(
				{
					schema: tenant,
					tableName: tableName,
					logging: false
				},
				columnName
			);
		}
	}

	// Get names of tables in public schema.
	const publicTableNames = await queryInterface.showAllTables();

	// Update the template table.
	if (publicTableNames.indexOf('Template') > -1) {

		// Get current template record for target table.
		const templateModel = await this.getTable(queryInterface, 'Template', 'public');
		const toModifyRecord = await templateModel.findOne(
			{
				where: {
					tableName: tableName
				},
				logging: false
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
				logging: false
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
module.exports.getDefinitionFromFile = (fileName, tenant) => {
	const attributes = require('./../seeds/models/defs/' + fileName + '.json');
	return this.processAttributes(attributes, tenant);
}

/**
 * Substitute in the correct values for attributes.
 * 
 * @param attributes The name of the file to get the definition from.
 * @param tenant The tenant the schema should belong to.
 * @returns The definition object.
 */
module.exports.processAttributes = (attributes, tenant) => {
	const attributesClone = JSON.parse(JSON.stringify(attributes));
	update(attributesClone, tenant);
	return attributesClone;
}

/**
 * A recursive function for substituting values in a nested object.
 *
 * @param object The object to replace values in.
 * @param tenant The tenant to replace some values with.
 */
const update = (object, tenant) => {
    Object.keys(object).forEach(
		(key) => {
			if (object[key] && typeof object[key] === 'object') {
				return update(object[key], tenant)
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
