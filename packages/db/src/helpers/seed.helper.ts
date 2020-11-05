/**
 * @packageDocumentation
 * @module migrations
 */
import * as fs from 'fs';
import * as redis from 'redis';
import { Model, Transaction } from 'sequelize';
import { MigrationHelper } from './migration.helper';

/**
 * An interface representing tenant info records.
 */
export interface ITenantInfo {

  /**
   * The unique ID of this tenant.
   */
  id: string;

  /**
   * The shorthand name of this tenant.
   */
  schemaName: string;

}

/**
 * An interface representing objects with model information in from a file.
 */
export interface IModel {

  /**
   * The name of the model in the database.
   */
  tableName: string;

  /**
   * The file name of the model.
   */
  modelName: string;

  /**
   * Flag indicating if the model has time stamps.
   */
  timestamps: boolean;

}

/**
 * Class which helps with seeding migrations.
 */
export class SeedHelper {

  /**
   * The redis client.
   */
  private static redisClient: redis.RedisClient = null;

  /**
   * Array for holding models.
   */
  public static modelList: IModel[] = [];

  /**
   * The tenant being seeded.
   */
  private static seedTenant = '';

  /**
   * The model list to use mode.
   */
  private static models: Model<unknown, unknown, any>[] = [];

  /**
   * Set the tenant to interact with.
   *
   * @param suppliedTenant The name of tenant.
   */
  public static setTenant (suppliedTenant: string) {
    SeedHelper.seedTenant = suppliedTenant;
    SeedHelper.modelList = [];
    SeedHelper.models = [];
  }

  /**
   * Get the name of the tenant the helper is set to interact with.
   *
   * @returns The name of tenant.
   */
  public static getTenant(): string {
    return SeedHelper.seedTenant;
  }

  /**
   * Read contents from files to create database tables.
   *
   * @param transaction The transaction object.
   */
  public static async setupTables (transaction: Transaction) {
    for (const model of await SeedHelper.getModelList()) {
      await SeedHelper.setupTable(
        transaction,
        model.tableName,
        model.modelName,
        model.timestamps
      );
    }
  }

  /**
  * Read contents from files to populate database tables
  *
  * @param transaction The transaction object.
  */
  public static async populateTables (transaction: Transaction) {
    for (const model of await SeedHelper.getModelList()) {
      await SeedHelper.populateTable(
        transaction,
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
  public static async getRedisValues (key: string) {
    return await new Promise(
      (resolve, reject) => {
        SeedHelper.getRedisClient().get(
          key,
          (err, val) => {
            if (err) {
              reject(err);
              return;
             }
             if (val == null) {
              resolve(null);
              return;
             }
             resolve(val);
          }
        );
      }
    );
  }

  /**
  * Set a value in redis..
  *
  * @param key The redis key to set.
  * @param value The value to set.
  */
  public static setRedisValues = async (key: string, value: string) => {
    return await new Promise(
      (resolve, reject) => {
        SeedHelper.getRedisClient().set(
          key,
          value,
          (err, val) => {
            if (err) {
              reject(err);
              return;
             }
             if (val == null) {
              resolve(null);
              return;
             }
             resolve();
          }
        );
      }
    );
  }

  /**
  * Delete a value from redis..
  *
  * @param key The redis key to delete.
  */
  public static delRedisValues = async (key: string) => {
    return await new Promise(
      (resolve, reject) => {
        SeedHelper.getRedisClient().del(
          key,
          (err, val) => {
            if (err) {
              reject(err);
              return;
             }
             if (val == null) {
              resolve(null);
              return;
             }
             resolve();
          }
        );
      }
    );
  }

  /**
  * Read contents from a file and put it in a database table.
  *
  * @param transaction The transaction object.
  * @param queryInterface The query interface object.
  * @param tableName The table to put contents into.
  * @param fileName The name of the file to read contents from.
  * @param timestamps Flag to indicate if timestamps should be added.
  */
  private static async setupTable (
    transaction: Transaction,
    tableName: string,
    fileName: string,
    timestamps = false
  ) {
    const attributes = MigrationHelper.getDefinitionFromFile(fileName, SeedHelper.seedTenant);
    const model = MigrationHelper.getSequelize().define(
      tableName,
      attributes,
      {
        schema: SeedHelper.seedTenant,
        freezeTableName: true,
        timestamps: timestamps
      },
    );
    await (<any>model).sync({transaction});
    SeedHelper.models[tableName] = model;
    return model;
  }

  /**
  * Read contents from a file (if it exists) and put it in a database table.
  *
  * @param transaction The transaction object.
  * @param tableName The table to put contents into.
  * @param fileName The name of the file to read contents from.
  */
  private static async populateTable (transaction: Transaction, tableName: string, fileName: string) {
    const model = SeedHelper.models[tableName];
    const modelContentsLoc = __dirname + '/../seeds/tenants/' + SeedHelper.seedTenant + '/' + fileName + '.json';
    if (fs.existsSync(modelContentsLoc)) {
      const contents = JSON.parse(fs.readFileSync(modelContentsLoc, 'utf8'));
      await model.bulkCreate(
        contents,
        {
          logging: false,
          transaction
        }
      );
    }
  }

  /**
  * Get the Redis client (wait for the database to start up if needed).
  *
  * @Returns The Redis client.
  */
  private static getRedisClient () {
    if (SeedHelper.redisClient === null) {
      console.log('Waiting for redis database connection...');
      const env = process.env.NODE_ENV || 'development';
      const config = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf8'))[env];
      SeedHelper.redisClient = redis.createClient(config.redis);
    }
    return SeedHelper.redisClient;
  }

  /**
   * Get the appropriate list of models (in order).
   *
   * @returns The appropriate model list.
   */
  private static async getModelList (): Promise<IModel[]> {
    if (SeedHelper.modelList.length === 0) {
      const modelListLoc = __dirname + '/../seeds/models/list.json';
      SeedHelper.modelList = JSON.parse(fs.readFileSync(modelListLoc, 'utf8'));
    }
    return SeedHelper.modelList;
  }

}
