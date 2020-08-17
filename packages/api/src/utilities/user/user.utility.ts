/**
 * @packageDocumentation
 * @module utilities
 */
import {Action} from 'routing-controllers';

/**
 * Get information on a user making a request.
 *
 * @param action A routing action.
 * @returns A promise which attempts to get information on the user making the request.
 */
export function userUtility (action: Action): Promise<{}> {

  // If user-information is required this can be added to later.
  console.log(action.request);
  return Promise.resolve({});

}
