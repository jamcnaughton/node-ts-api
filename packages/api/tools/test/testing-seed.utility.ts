/**
 * @packageDocumentation
 * @module tools
 */
import * as Bluebird from 'bluebird';
import {exec} from 'child_process';
import {demoService} from 'packages/api/src/service/demo';
import {redisService} from 'packages/api/src/service/redis';
import {wipeUtility} from '../wipe';

/**
 * Class which handles seeding the databases.
 */
export class TestingSeedUtility {


  /**
   * The location to store any expected content to in the bucket.
   */
  public static redisTenants = 'demo';


  /**
   * A flag to say the database has already been seeded.
   */
  public static seeded = false;


  /**
   * Seed the database by running the required database migrations.
   */
  public seed (): Bluebird<Object> {

    // Check if a full seed or just a reset is required.
    if (!TestingSeedUtility.seeded) {

      // Set as seeded.
      TestingSeedUtility.seeded = true;

      // Wipe the database.
      return wipeUtility.wipe()

      // Run seed migrations (use sequelize-migrate).
      .then(
        () => new Promise((resolve, reject) => {
          exec(
            'npm run db:migrate',
            {env: process.env},
            (err, stdOut) => {
              if (err) {
                reject(err);
              } else {
                console.log(stdOut);
                resolve();
              }
            }
          );
        })
      );

    } else {

      // Restore the demo tenant.
      return demoService.reset();

    }

  }

  /**
   * Set up the redis database.
   */
  public seedRedis (): Bluebird<Object> {

    // Return a which attempts to populate the Redis data store.
    redisService.establishClient();
    return new Bluebird(
      (resolve: Function, reject: Function): boolean => redisService.client
        .set('tenants', TestingSeedUtility.redisTenants, (err: Error, value: string) => {

          // Return an error if unable to populate the Redis data store.
          if (err) {
            return reject(err);
          }

          // Set tenants to match the input (i.e. no contained keys) in the Redis data store.
          return resolve(value);

        })
    );

  }

}

/**
 * A utility object which handles seeding the database for tests seed.
 */
export const testingSeedUtility: TestingSeedUtility = new TestingSeedUtility();
