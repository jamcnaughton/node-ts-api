/**
 * @packageDocumentation
 * @module utilities
 */
import {Action} from 'routing-controllers';

/**
 * Check that the user has an authorised role if needed.
 *
 * @param action The routing action being performed.
 * @param roles The roles allowed to perform the routing action.
 * @returns A promise which determines if the user has the appropriate role.
 */
export function authorisationUtility (action: Action, roles: string[]): Promise<boolean> {

  // If authorisation is required this can be added to later.
  console.log(action.request);
  console.log(roles);
  return Promise.resolve(true);

}
