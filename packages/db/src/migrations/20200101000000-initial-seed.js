// Imports.
const migrationHelper = require(__dirname + '/../helpers/migration.helper.js');
const seedHelper = require(__dirname + '/../helpers/seed.helper.js');
const demoHelper = require(__dirname + '/../helpers/demo-backup.helper.js');
const fs = require('fs');
const v4 = require('uuid/v4');

/**
 * A change for the database.
 */
module.exports.up = async (queryInterface, Sequelize, done) => {

	// Read tenants to seed from list.
	const tenantLoc = __dirname + '/../seeds/seed-list.json';
	const tenants = JSON.parse(fs.readFileSync(tenantLoc, 'utf8'));

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
	const tenantInfoModel = migrationHelper.getSequelise().define(
		'TenantInfo',
		tenantInfoAttributes,
		{
			schema: 'public',
			freezeTableName: true,
			timestamps: false
		}
	);
	await tenantInfoModel.sync();

	// Loop through tenants to seed.
	for (const tenant of tenants) {

		// Set the helper's tenant.
		seedHelper.setTenant(tenant.schemaName);

		// Create Schema.
		await queryInterface.createSchema(
			`"${tenant.schemaName}"`
		);

		// Set up tables.
		await seedHelper.setupTables();

		// Populate relevant tables.
		await seedHelper.populateTables();

		// Add tenant to redis.
		const redisTenants = await seedHelper.getRedisValues('tenants');
		if (redisTenants === null) {
			await seedHelper.setRedisValues('tenants', tenant.schemaName);
		} else {
			await seedHelper.setRedisValues('tenants', redisTenants + ',' + tenant.schemaName);
		}
		
		// Initialise the record in the tenant info table.
		await queryInterface.bulkInsert(
			'TenantInfo',
			[
				{
					id: tenant.id,
					schemaName: tenant.schemaName
				}
			]
		)

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
	const demoBackupModel = migrationHelper.getSequelise().define(
		'DemoBackup',
		demoBackupAttributes,
		{
			schema: 'public',
			freezeTableName: true,
			timestamps: false
		}
	);
	await demoBackupModel.sync();

	// Call demo tenant backup.
	await demoHelper.backup(queryInterface);

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
	const templateModel = migrationHelper.getSequelise().define(
		'Template',
		templateAttributes,
		{
			schema: 'public',
			freezeTableName: true,
			timestamps: false
		}
	);
	await templateModel.sync();

	// Build the records of original templates.
	const modelListLoc = __dirname + '/../seeds/models/list.json';
	modelList = JSON.parse(fs.readFileSync(modelListLoc, 'utf8'));
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
		)
		i++;
	}

	// Create the records for the original templates.
	await templateModel.bulkCreate(
		templateRecords
	);

	// Complete migration.
	done();

};

/**
 * A rollback of a change for the database.
 */
module.exports.down = async (queryInterface, Sequelize, done) => {

	// Read tenants from seed-list.
	const tenantLoc = __dirname + '/../seeds/seed-list.json';
	const tenants = JSON.parse(fs.readFileSync(tenantLoc, 'utf8'));

	// Destroy the demo backup table.
	queryInterface.dropTable('DemoBackup');

	// Destroy the template table.
	queryInterface.dropTable('Template');

	// Loop through tenants to remove.
	for (const tenant of tenants) {

		// Remove from the tenant info table.
		await queryInterface.bulkDelete(
			'TenantInfo',
			{
				id: tenant.id
			}
		);

		// Delete schema
		await queryInterface.dropSchema(
			tenant
		);				

		// Remove tenant from redis.
		const redisTenants = await seedHelper.getRedisValues('tenants');
		if (redisTenants === tenant.schemaName) {
			await seedHelper.setRedisValues('tenants', null);
		} else {
			const newTenantsList = [];
			for (const redisTenant of tenants.split(',')) {
				if (redisTenant !== tenant.schemaName) {
					newTenantsList.push(redisTenant);
				}
			}
			await seedHelper.setRedisValues('tenants', newTenantsList.join(','));
		}		

	}

	// Destroy the tenant info table.
	queryInterface.dropTable('TenantInfo');

	// Complete migration.
	done();

};

