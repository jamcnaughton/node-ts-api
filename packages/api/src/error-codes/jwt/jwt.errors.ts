/**
 * @packageDocumentation
 * @module service
 */
import {IServiceErrorCode} from '../../utilities/service-error';

/**
 * A set of error codes mapped to their meanings, specific to JWTs.
 */
export const JWTErrorCodes: IServiceErrorCode = {
  ERRJWT000: 'no jwt present',
  ERRJWT001: 'invalid jwt'
};
