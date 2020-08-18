/**
 * @packageDocumentation
 * @module utilities
 */
import * as uuidv4 from 'uuid/v4';
import {buildServiceError, IServiceError} from './service-error.interface';

/**
 * An interface representing structured responses to send to the front end.
 */
export interface IResponse {

  /**
   * A unique ID for the responses.
   */
  id: string;

  /**
   * A REST code for the response.
   */
  code: number;

  /**
   * A readable description of the response status.
   */
  status: string;

  /**
   * A timestamp of when the response was created.
   */
  timestamp: string;

  /**
   * Readable descriptions of information to convey.
   */
  messages?: string[];

  /**
   * Details on the error related to the response.
   */
  error?: IServiceError;

  /**
   * The payload of the response.
   */
  result?: {};

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
 * @param errors The errors to include descriptions of in the responses.
 * @param code The status code to be returned in the response.
 * @param status The readable status the response should have.
 * @param messages The message to include in the response.
 * @returns An error response object.
 */
export function buildResponse (
  results: {},
  code: number = 200,
  status: string = null,
  messages: string[] = []
): IResponse {
  return <IResponse>{
    id: uuidv4(),
    code: code,
    status: status ? status : statuses[code],
    timestamp: new Date().toISOString(),
    messages: messages,
    results: results
  };

}

/**
 * Construct an error response object.
 *
 * @param error The error to include in the response.
 * @param code The status code to be returned in the response.
 * @returns An error response object.
 */
export function buildErrorResponse (
  error: Error | IServiceError,
  code: number = 500
): IResponse {

  // Convert typical error to service error.
  if (!error['restCode']) {
    error = buildServiceError(
      (<Error>error).name,
      (<Error>error).message,
      code
    );
  }

  // Return the response object.
  return <IResponse>{
    id: uuidv4(),
    code: code,
    status: statuses[code],
    timestamp: new Date().toISOString(),
    error: error
  };

}
