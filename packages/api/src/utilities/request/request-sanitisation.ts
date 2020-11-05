/**
 * @packageDocumentation
 * @module utilities
 */

/**
 * Ensure a string parameter is sanitised.
 */
export function sanitiseStringParam (paramIn: any): string {
  const param = <string>paramIn;
  if (!param || param.toLowerCase() === '' || param.toLowerCase() === 'null' || param.toLowerCase() === 'undefined') {
    return null;
  }
  return param;
}
