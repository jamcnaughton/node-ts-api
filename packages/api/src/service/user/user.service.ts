/**
 * @packageDocumentation
 * @module service
 */
import * as Bluebird from 'bluebird';
import {IJwtAttributes} from '../../model/jwt';
import {Role} from '../../model/role';
import {User} from '../../model/user';

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

}

/**
 * A service which handles interaction with the data stores relating to general user information.
 */
export const userService: UserService = new UserService();
