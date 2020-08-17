/**
 * @packageDocumentation
 * @module utilities
 */
import {Response} from 'express';
import * as uuidv4 from 'uuid/v4';
import {logService} from '../../service/log';
import {camelCase} from '../case';

/**
 * An interface representing objects containing service error information.
 */
export interface IServiceError {

  /**
   * An optional array of details.
   */
  details?: string[];

  /**
   * An optional array of error codes.
   */
  errorCode?: string;

  /**
   * The error message.
   */
  message: string;

  /**
   * The rest code of the error.
   */
  restCode: number;

}

/**
 * A class representing service errors.
 */
export class ServiceError {

  /**
   * An optional array of error codes.
   */
  public errorCode?: string;

  /**
   * The rest code of the error.
   */
  public errorString?: string;

  /**
   * The error message.
   */
  public message?: string;

  /**
   * The rest code of the error.
   */
  public restCode?: number;

}

/**
 * Map indexed by REST status codes containing descriptions of statuses.
 */
const statuses: any = {
  200: 'ok',
  400: 'bad_request',
  401: 'unauthorized',
  402: 'request_failed',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  422: 'unprocessable_entity',
  429: 'rate_limit_error',
  500: 'internal_server_error',
  502: 'bad_gateway',
  503: 'service_unavailable',
  504: 'gateway_timeout'
};

/**
 * Construct an error response object.
 *
 * @param code The status code to be returned in the response.
 * @param errors The errors to include descriptions of in the responses.
 * @returns An error response object.
 */
export function buildErrorResponse (code: number = 500, errors: ServiceError[], res?: Response) {
  const returnValue = {
    code,
    status: statuses[code],
    'id': uuidv4(),
    timestamp: new Date().toISOString(),
    errors
  };
  if (res) {
    return res.status(code).json(returnValue);
  } else {
    return returnValue;
  }
}

/**
 * Prepare a structured response containing results.
 *
 * @param res The response object.
 * @param data The part of the response containing the payload.
 * @param code The REST status code the response should have.
 * @param status The readable status the response should have.
 * @param messages The message to include in the response.
 * @returns A structured response object.
 */
export function resultsResponse (
    res: Response,
    data: any,
    code: number = 200,
    status: string = 'ok',
    messages: string[] = []
): Response {
  return res.status(code)
  .json(
    {
      state: status,
      code: code,
      messages: messages,
      result: data
    }
  );
}


/**
 * Prepare a structured response containing error details.
 *
 * @param res The response object.
 * @param error The message to include in the response.
 * @param status The REST status code the response should have.
 * @returns A structured response object.
 */
export function errorResponse (
  res: Response,
  error: Error | ServiceError,
  status: number = 500
): Response {

  // Establish the service error object.
  const err: IServiceError = {
    message: camelCase(error.message),
    restCode: status
  };

  // Get the rest code from the error.
  if (error.hasOwnProperty('restCode')) {
    err.restCode = (<ServiceError>error).restCode;
  }

  // Get the error code from the error.
  if (error.hasOwnProperty('errorCode')) {
    err.errorCode = (<ServiceError>error).errorCode;
  }

  // Output the error stack trace.
  if (error['stack']) {
    logService.logger.error(error['stack']);
  }

  // Return the response with the error details in it.
  return res.status(err.restCode)
  .json(
    {
      code: err.restCode,
      status: statuses[err.restCode],
      'id': uuidv4(),
      timestamp: new Date().toISOString(),
      errors: {
        ...err
      }
    }
  );

}
