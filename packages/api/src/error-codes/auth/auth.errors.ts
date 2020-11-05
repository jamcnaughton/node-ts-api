/**
 * @packageDocumentation
 * @module error-codes
 */
import {IServiceErrorCode} from '../../utilities/service-error';

/**
 * A set of error codes mapped to their meanings, specific to the endpoint.
 */
export const AuthErrorCodes: IServiceErrorCode = {
  ERRAUTH000: 'email is either missing or an empty string',
  ERRAUTH001: 'password is either missing or an empty string',
  ERRAUTH002: 'tenant is either missing or an empty string',
  ERRAUTH003: 'email address and password combination failed',
  ERRAUTH004: 'user is locked out - login attempts limit exceeded'
};
