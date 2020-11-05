/**
 * @packageDocumentation
 * @module utilities
 */
import {RegexUtility} from '../regex';

/**
 * Utility function for putting a string into camelCase.
 *
 * @param input The string to put into camelCase.
 * @returns The string in camelCase.
 */
export function camelCase (input: string): string {

  // Establish input.
  let response: string = input;

  // Find appropriate regex and apply if present and valid.
  if ((<RegExp>RegexUtility.camelCase).test(response) || (<RegExp>RegexUtility.lowercaseSentence).test(response)) {
    try {
      response = input
        .replace(RegexUtility.camelCase, '$1 $2')
        .toLowerCase()
        .replace(RegexUtility.start, (res: string) => res.toUpperCase());
    } catch (e) {
      response = input;
    }
  }

  // Return the string in camelCase.
  return response;

}
