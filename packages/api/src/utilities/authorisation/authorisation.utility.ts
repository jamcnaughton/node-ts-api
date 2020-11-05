/**
 * @packageDocumentation
 * @module utilities
 */
import {Action} from 'routing-controllers';
import {IJwtAttributes} from '../../model/jwt';
import {Role} from '../../model/role';
import {User} from '../../model/user';
import {jwtService} from '../../service/jwt';

/**
 * Check that the user has an authorised role if needed.
 *
 * @param action The routing action being performed.
 * @param roles The roles allowed to perform the routing action.
 * @returns A promise which determines if the user has the appropriate role.
 */
export function authorisationUtility (action: Action, roles: string[]): Promise<boolean> {

  // Get the token contents.
  return jwtService.readToken(action.request)

  // Get the user with their ID and tenant.
  .then(
    (token: IJwtAttributes) => User.findOne(
      {
        attributes: [
          'id'
        ],
        include: [
          {
            attributes: [
              'name'
            ],
            model: Role
          }
        ],
        searchPath: `"${token.tenant}"`,
        where: {
          id: token.id
        }
      }
    )
  )

  .then(
    (user: User) => {

      // Check if the user has the appropriate role.
      if (typeof roles !== 'string') {
        return roles.some(
          (role: string) => !!user.roles.find(
            (tokenRole: Role) => tokenRole.name === role
          )
        );
      }

      // User does not have the appropriate role.
      return false;

    }

  )
  .catch(
    () => false
  );

}
