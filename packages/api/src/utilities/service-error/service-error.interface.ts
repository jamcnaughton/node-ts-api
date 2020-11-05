/**
 * @packageDocumentation
 * @module utilities
 */

import {IServiceErrorCode} from './service-error-code.interface';

/**
 * An interface representing objects representing a service error.
 */
export interface IServiceError {

  /**
   * The rest code of the error.
   */
  restCode: number;

  /**
   * The error message.
   */
  errorString: string;

  /**
   * An array of values containing specific error details.
   */
  details?: IServiceErrorDetails[];

}

/**
 * An interface representing objects containing service error details.
 */
export interface IServiceErrorDetails {

  /**
   * Short hand string to ID the error.
   */
  errorCode: string;

  /**
   * The error message explaining the specific error.
   */
  message: string;

  /**
   * Additional information on the error.
   */
  info?: string;

}

/**
 * A function to build a service error object.
 */
export function buildServiceError (
  restCode: number,
  errorString: string,
  errorCodeKey: string,
  errorCodes: IServiceErrorCode
): IServiceError {
  return buildServiceErrorDirect(restCode, errorString, errorCodeKey, errorCodes[errorCodeKey]);
}

/**
 * A function to build a service error with using service error codes.
 */
export function buildServiceErrorDirect (
  restCode: number,
  errorString: string,
  errorCode: string = null,
  message: string = null,
  details: string= ''
): IServiceError {
  let serviceError: IServiceError = {
    restCode: restCode,
    errorString: errorString,
    details: []
  };
  if (errorCode || message) {
    serviceError = appendToServiceError(serviceError, errorCode, message, details);
  }
  return serviceError;
}

/**
 * A function to append additional error information to a service error.
 */
export function appendToServiceError (
  serviceError: IServiceError,
  errorCode: string = '',
  message: string,
  details: string = ''
): IServiceError {
  serviceError.details.push(
    {
      errorCode: errorCode,
      message: message,
      info: details
    }
  );
  return serviceError;
}



/**
 * Token for packing and unpacking sequelize error messages.
 */
const packingErrorToken = '=#=';

/**
 * Pack up details on a sequelize error for a journey through sequelize's error passing mechanism.
 *
 * @param errorCode The error code to use.
 * @param errorCodes The set of error codes to use.
 * @returns A single string which can be passed through sequelize's error passign mechanism.
 */
export function packSequelizeErrors(errorCode: string, errorCodes: IServiceErrorCode): string {
  return [errorCode, errorCodes[errorCode]].join(packingErrorToken);
}

/**
 * Attempts to unpack details on a sequelize error sent through sequelize's error passing mechanism.
 *
 * @param errorString The message to unpack.
 * @returns An object containing values to use in a service error.
 */
export function unpackSequelizeErrors(errorString: string): {code: string, message: string} {
  const errorValues = errorString.split(packingErrorToken);
  if (errorValues.length === 1) {
    return {
      code: 'SequelizeErr',
      message: errorValues[0]
    };
  }
  return {
    code: errorValues[0],
    message: errorValues[1]
  };
}
