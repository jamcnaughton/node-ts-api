// Imports.
const fs = require('fs');
const redis = require('redis');
const env = process.env.NODE_ENV || 'development';
const bluebird = require('bluebird');
const migrationHelper = require(__dirname + '/migration.helper.js');
const config = JSON.parse(fs.readFileSync(__dirname + '/../../config.json', 'utf8'))[env];
bluebird.promisifyAll(redis);

/**
 * The redis client.
 */
let redisClient = null;

/**
 * Array for holding models.
 */
let modelList = [];

/**
 * The tenant being seeded.
 */
let tenant = '';

/**
 * Flag to indicate up-to-date attributes should be gathered rather than those from files.
 */
let alternativeMode = false;

/**
 * The query interface (if needed).
 */
let queryInterface;

/**
 * The model list to use mode.
 */
let models = [];

/**
 * The table-index array of attributes to use in alterive mode.
 */
let alternativeAttributes = [];

/**
 * Set the tenant to interact with.
 * 
 * @param suppliedTenant The name of tenant.
 */
module.exports.setTenant = (suppliedTenant) => {
	tenant = suppliedTenant;
	modelList = [];
	models = [];
}

/**
 * Get the name of the tenant the helper is set to interact with.
 * 
 * @returns The name of tenant.
 */
module.exports.getTenant = () => {
	return tenant;
}

/**
 * Set the helper to use the alternative mode.
 * 
 * @param queryInterface The query interface.
 */
module.exports.useUpToDateSchemas = (queryInterfaceIn) => {
	alternativeMode = true;
	queryInterface = queryInterfaceIn;
}

/**
 * Read contents from files to create database tables.
 */
module.exports.setupTables = async () => {
	for (const model of await getModelList()) {
		await this.setupTable(
			model.tableName,
			model.modelName,
			model.timestamps
		);
	}
}

/**
* Read contents from files to populate database tables
*/
module.exports.populateTables = async () => {
	for (const model of await getModelList()) {
		await populateTable(
			model.tableName,
			model.modelName
		);
	}
}

/**
* Set a value in redis.
* 
* @param key The redis key to set.
* @param value The value to set.
*/
module.exports.getRedisValues = async (key) => {
	return await getRedisClient().getAsync(key);
}

/**
* Get a value from redis..
* 
* @param key The redis key to get.
* @returns The value of the key.
*/
module.exports.setRedisValues = async (key, value) => {
	await getRedisClient().setAsync(key, value);
}

/**
* Read contents from a file and put it in a database table.
*
* @param {string} tableName The table to put contents into.
* @param {string} fileName The name of the file to read contents from.
* @param {boolean} timestamps Flag to indicate if timestamps should be added.
*/
module.exports.setupTable = async (tableName, fileName, timestamps = false) => {
	let attributes;
	if (!alternativeMode) {
		attributes = migrationHelper.getDefinitionFromFile(fileName, tenant);
	} else {
		attributes = alternativeAttributes[tableName];
	}
	const model = migrationHelper.getSequelise().define(
		tableName,
		attributes,
		{
			schema: tenant,
			freezeTableName: true,
			timestamps: timestamps,
			logging: false
		}
	);
	await model.sync(
		{
			logging: false
		}
	);
	models[tableName] = model;
	return model;
}

/**
* Read contents from a file (if it exists) and put it in a database table.
*
* @param {string} tableName The table to put contents into.
* @param {string} fileName The name of the file to read contents from.
*/
const populateTable = async (tableName, fileName) => {
	const model = models[tableName];
	const modelContentsLoc = __dirname + '/../seeds/tenants/' + tenant + '/' + fileName + '.json'
	if (fs.existsSync(modelContentsLoc)) {
		let contents = JSON.parse(fs.readFileSync(modelContentsLoc, 'utf8'));
		await model.bulkCreate(
			contents,
			{
				logging: false
			}
		);
	}
}

/**
* Get the Redis client (wait for the database to start up if needed).
* 
* @Returns The Redis client.
*/
const getRedisClient = () => {
	if (redisClient === null) {
		console.log('Waiting for redis database connection...');
		redisClient = redis.createClient(config.redis);
	}
	return redisClient;
}

/**
 * Get the appropriate list of models (in order).
 * 
 * @returns The appropriate model list.
 */
const getModelList = async () => {
	if (modelList.length === 0) {
		if (!alternativeMode) {
			const modelListLoc = __dirname + '/../seeds/models/list.json'
			modelList = JSON.parse(fs.readFileSync(modelListLoc, 'utf8'));
		} else {
			const templateModel = await migrationHelper.getTable(queryInterface, 'Template', 'public');
			const templateRecords = await templateModel.findAll(
				{
					order: [
						['position', 'ASC']
					],
					logging: false
				}
			);
			for (const templateRecord of templateRecords) {

				// Get the file name.
				const fileName = templateRecord.tableName.replace(
					/(?:^|\.?)([A-Z])/g,
					(x, y) => {
						return '-' + y.toLowerCase();
					}
				).replace(/^-/, '');

				// Get the attributes of the table from the definition.
				const attributes = migrationHelper.processAttributes(JSON.parse(templateRecord.definition), tenant);

				// Check if this model needs time stamps.
				const timestamps = templateRecord.timestamps;

				// Store the attributes for later use.
				alternativeAttributes[templateRecord.tableName] = attributes;

				// Create the model record.
				modelList.push(
					{						
						tableName: templateRecord.tableName,
						modelName: fileName,
						timestamps: timestamps
					}
				);

			}
		}
	}
	return modelList;
}
