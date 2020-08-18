// Imports.
const seedHelper = require(__dirname + '/../helpers/seed.helper.js');

/**
 * The tenants to create.
 */
const tenants = [
  {
    schemaName: 'Tenant Name',
  }
];

/**
 * A change for the database.
 */
module.exports.up = async (queryInterface, Sequelize, done) => {

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
					schemaName: tenant.schemaName,
				}
			]
		)

	}

	// Complete migration.
	done();

};

/**
 * A rollback of a change for the database.
 */
module.exports.down = async (queryInterface, Sequelize, done) => {

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

	// Complete migration.
	done();

};

