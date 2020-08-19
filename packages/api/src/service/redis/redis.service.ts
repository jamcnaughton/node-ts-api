/**
 * @packageDocumentation
 * @module service
 */
import * as Bluebird from 'bluebird';
import * as redis from 'redis';
import {config} from '../../config';

/**
 * Service class for handling Redis related actions.
 */
export class RedisService {

  
  /**
   * How long to wait for database to appear (in seconds).
   */
  private static reconnectTimeout = 10;

  
  /**
   * The Redis client to communicate with.
   */
  public client: redis.RedisClient = null;

  
  /**
   * Clears the Redis data store.
   *
   * @param logging Flag to indicate whether logging is enabled.
   * @returns A promise which clears the data store.
   */
  public clearDb (logging = true): Promise<Object> {

    // Returns a promise which clears the data store.
    this.establishClient(logging);
    return new Promise(
      (resolve: Function, reject: Function): boolean => this.client
        .flushdb(
          (err: Error, value: string): void => {
            if (err) {
              reject(err);
            } else {
              resolve(value);
            }
          }
        )
    );

  }

  /**
   * Get the record for a supplied key.
   *
   * @param key The key to retrieve a record object for.
   * @returns A promise which attempts to get the record object.
   */
  public read (key: string): Bluebird<Object> {

    // Returns a promise which attempts to get the record object.
    this.establishClient();
    return new Bluebird(
      (resolve: Function, reject: Function): boolean => this.client
        .get(key, (err: Error, value: string): void => {
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        })
    );

  }

  /**
   * Set the record for a supplied key.
   *
   * @param key The key to set a record object for.
   * @param record The new record object to set.
   * @returns A promise which attempts to set the record object.
   */
  public set (key: string, record: string): Bluebird<Object> {

    // Returns a promise which attempts to set the record object.
    this.establishClient();
    return new Bluebird(
      (resolve: Function, reject: Function): boolean => this.client
        .set(key, record, (err: Error, value: string): void => {
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        })
    );

  }

  /**
   * Delete the record with a supplied key.
   *
   * @param store The key to delete a record object with.
   * @returns A promise which attempts to delete the record object.
   */
  public destroy (store: string): Bluebird<Object> {

    // Returns a promise which attempts to delete the record object.
    this.establishClient();
    return new Bluebird(
      (resolve: Function): boolean => {
        return this.client.del(store, () => resolve());
      }
    );

  }

  /**
  * Create the client (wait for the database to start up if needed).
  *
  * @param logging Flag to indicate whether logging is enabled.
  */
 public establishClient (logging = true): void {
    if (this.client === null) {
      if (logging) {
        console.log('Waiting for redis database connection...');
      }
      const startTime: Date = new Date();
      this.client = redis.createClient(config.redis);
      this.client.on('error', (err) => {
        const timeDiff = Math.abs(new Date().getTime() - startTime.getTime());
        if (timeDiff / 1000 > RedisService.reconnectTimeout) {
          throw err;
        }
      });
    }
 }

}

/**
 * A service which handles interactions with the Redis data store.
 */
export const redisService: RedisService = new RedisService();
