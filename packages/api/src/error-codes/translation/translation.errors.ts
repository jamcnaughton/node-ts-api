/**
 * @packageDocumentation
 * @module error-codes
 */
import {IServiceErrorCode} from '../../utilities/service-error';

/**
 * A set of error codes mapped to their meanings, specific to the endpoint.
 */
export const TranslationErrorCodes: IServiceErrorCode = {
  ERRTRANS000: 'tenant is either missing or an empty string',
  ERRTRANS001: 'languageId is either missing or is not a valid GUID'
};
