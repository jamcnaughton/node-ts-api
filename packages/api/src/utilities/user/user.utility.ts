/**
 * @packageDocumentation
 * @module utilities
 */
import * as Bluebird from 'bluebird';
import {Action} from 'routing-controllers';
import {IJwtAttributes} from '../../model/jwt';
import {User} from '../../model/user';
import {jwtService} from '../../service/jwt';
import {userService} from '../../service/user';

/**
 * Get information on a user making a request.
 *
 * @param action A routing action.
 * @returns A promise which attempts to get information on the user making the request.
 */
export function userUtility (action: Action): Promise<{}> {

  // Returns a promise which attempts to get information on the user the token belongs to.
  return jwtService.readToken(action.request)
  .then(
    (token: IJwtAttributes) => {

      // Returns a promise which gets the user information.
      return <Bluebird<User>>userService.getUserFromToken(token);

    }
  );

}
