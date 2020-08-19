/**
 * @packageDocumentation
 * @module tools
 */
// tslint:disable no-console
import * as Bluebird from 'bluebird';
import {sequelize} from '../../src/model';
import {redisService} from '../../src/service/redis';

/**
 * Class which handles wiping the SQL data store.
 */
export class WipeUtility {

  /**
   * How many times to try to connect to the database before giving up.
   */
  private static reconnectAttemptLimit = 5;

  /**
   * How long to wait between attempts to connect to the database.
   */
  private static reconnectDelay = 15000;

  /**
   * Clear the SQL and Redis data stores.
   *
   * @param logging Flag to indicate whether logging is enabled.
   * @returns A promise which clears both the data stores.
   */
  public wipe (logging = true): Bluebird<Object> {

    // Get query objects.
    const loggingObj = logging ? {} : {logging: false};
    const loggingAndCascadingObj = logging ? {cascade: true} : {cascade: true, logging: false};

    // Get available tenants.
    return this.waitForDb(1, logging)

    // Clear the SQL data store.
    .then(
      () => sequelize.showAllSchemas(loggingObj)
    )
    .then(
      (schemas: string[]) => {
        const schemaDropPromises: Bluebird<any>[] = [];
        for (const schema of schemas) {
          schemaDropPromises.push(
            sequelize.dropSchema(`"${schema}"`, loggingObj)
          );
        }
        return Bluebird.all(schemaDropPromises);
      }
    )
    .then(
      () => sequelize.drop(loggingAndCascadingObj)
    )

    // Clear the migration table too.

    .then(
      () => {
        return sequelize.query('DROP TABLE public."SequelizeMeta"', loggingObj)
        .catch(
          () => {
            if (logging) {
              console.log('No migration table to wipe.');
            }
          }
        );
      }
    )

    // Return a promise which clears the redis data store.
    .then(
      () => redisService.clearDb(logging)
    );

  }

  /**
   * Wait until there is a database present before seeding.
   *
   * @param attempt The count of attempts to connect to the database.
   * @param logging Flag to indicate whether logging is enabled.
   * @returns A promise which authenticates or waits a bit longer.
   */
  private waitForDb (attempt: number, logging: boolean): Bluebird<void> {
    const loggingObj = logging ? {} : {logging: false};
    if (logging) {
      console.log('Waiting for database connection...');
    }
    return sequelize.authenticate(loggingObj)
    .catch(
      (err: Error) => {
        if (attempt >= WipeUtility.reconnectAttemptLimit) {
          throw err;
        }
        return new Bluebird(resolve => setTimeout(resolve, WipeUtility.reconnectDelay))
        .then(
          () => {
            attempt += 1 ;
            return this.waitForDb(attempt, logging);
          }
        );
      }
    );
  }

}

/**
 * A utility object which handles wiping Redis and SQL data stores.
 */
export const wipeUtility: WipeUtility = new WipeUtility();
