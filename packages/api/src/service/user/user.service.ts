/**
 * @packageDocumentation
 * @module service
 */
import * as Bluebird from 'bluebird';
import {IJwtAttributes} from '../../model/jwt';
import {Role} from '../../model/role';
import {User} from '../../model/user';
import {redisService} from '../redis';
import {config} from '../../config/config.development';

/**
 * Service class for handling user related actions.
 */
export class UserService {

  /**
   * Get information for one specific user.
   *
   * @param id The ID of the user to get information for.
   * @param tenant The tenant the user belongs to.
   * @returns A promise which attempts to get the specified user.
   */
  public getUserFromToken (token: IJwtAttributes): Bluebird<User> {

    // Returns a promise which attempts to get the specified user.
    return User.findOne(
      {
        include: [Role],
        searchPath: `"${token.tenant}"`,
        where: {
          id: token.id
        }
      }
    );

  }

  /**
   * Get a user's preferred language .
   *
   * @param id The ID of the user.
   * @param tenant The tenant the user belongs to.
   * @returns A promise which attempts to get the preferred language code of the user.
   */
  public getUserPreferredLanguage (id: string, tenant: string): Bluebird<string> {
    return User.findOne(
      {
        attributes: [
          'id',
          'preferredLanguageId'
        ],
        searchPath: `"${tenant}"`,
        where: {
          id: id
        }
      }
    )
    .then(
      (user: User) => user.preferredLanguageId
    );
  }

  /**
   * Check if the user has failed too many attempts to log in.
   *
   * @param emailAddress The e-mail address of the user attempting to log in.
   * @returns A promise which attempts to find the user and returns whether they have exceeded their permitted
   * number of login attempts, if not it returns the number of login attempts.
   */
  public getLoginAttempts (emailAddress: string): Bluebird<number> {
    const key = `customer:lockout:${emailAddress}`;
    return redisService.read(key)
    .then(
      (attempts: string) => {
        const attemptsNumber: number = parseInt(attempts, 10);
        return attemptsNumber;
      }
    );
  }

  /**
   * Increment the number of log in attempts for a user when they fail to log in.
   *
   * @param emailAddress The e-mail address of the user attempting to log in.
   * @returns A promise which creates a login attempts entry for the user or increments the value for it.
   */
  public setFailedAttempt (emailAddress: string): Bluebird<boolean> {

    // Establish the query string for getting the user's lockout status.
    const key = `customer:lockout:${emailAddress}`;

    // Returns a promise which creates a login attempts entry for the user or increments the value for it.
    return redisService.read(key)
    .then(
      (attempts: number) => new Promise(
        (resolve: any): boolean => {
          if (attempts) {
            return redisService.client.incr(key, resolve);
          }
          return redisService.client.set(key, '1', resolve);
        }
      )
    )
    .then(
      () => redisService.client.expire(key, config.accountSecurity.lockoutTime)
    );
  }

  /**
   * Clear a user's number of failed attempts at logging in stored in the redis data store.
   *
   * @param emailAddress The e-mail address of the customer to clear failed attempts for.
   * @returns A promise which attempts to find the user and set their number of failed attempts to 0.
   */
  public clearFailedAttempts (emailAddress: string): Promise<Object> {
    return new Promise(
      (resolve: any): Bluebird<Object> => {
        const key = `customer:lockout:${emailAddress}`;
        return redisService.read(key)
        .then(
          (val: any) => {
            if (val != null) {
              return redisService.destroy(key)
              .then(resolve);
            } else {
              return resolve();
            }
          }
        );
      }
    );
  }

  /**
   * Check that a user exists for a given e-mail address.
   *
   * @param email The e-mail address to find a user for.
   * @param tenant The tenant the user must belong to.
   * @returns A promise which attempts to find a user for the supplied e-mail address and return their details.
   */
  public authenticate (email: string, tenant: string): Bluebird<User> {
    return User.findOne(
      {
        attributes: [
          'email',
          'id',
          'firstName',
          'surname',
          'password',
          'passwordSalt',
          'tenant'
        ],
        include: [
          {
            attributes: [
              'name'
            ],
            model: Role
          },
        ],
        searchPath: `"${tenant}"`,
        where: {
          email: email
        }
      }
    );
  }

}

/**
 * A service which handles interaction with the data stores relating to general user information.
 */
export const userService: UserService = new UserService();
