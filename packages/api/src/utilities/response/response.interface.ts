/**
 * @packageDocumentation
 * @module utilities
 */
import * as Sequelize from 'sequelize';
import * as uuidv4 from 'uuid/v4';
import {IPaginationInstance} from '../pagination';
import {appendToServiceError, buildServiceErrorDirect, IServiceError, unpackSequelizeErrors} from '../service-error';

/**
 * An interface representing the basics of a structured response to send to the front end.
 */
export interface IResponseShell {

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
   * Information on the error related to the response.
   */
  errorInfo?: IServiceError;

}

/**
 * An interface representing structured responses to send to the front end.
 */
export interface IResponse<T> extends IResponseShell {

  /**
   * The payload of the response.
   */
  payload?: IResponsePayload<T>;

}

/**
 * An interface representing structured responses results.
 */
export interface IResponsePayload<T> {

  /**
   * The single payload of the response.
   */
  result?: T;

  /**
   * The array payload of the response.
   */
  results?: T[];

  /**
   * The paginated array payload of the response.
   */
  paginatedResults?: IPaginationInstance<T>;

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
export function buildResultsResponse<T> (
  results: IResponsePayload<T>,
  code: number = 200,
  status: string = null,
  messages: string[] = []
): IResponse<T> {

  // Build the response.
  const response: IResponse<T> = {
    id: uuidv4(),
    code: code,
    status: status ? status : statuses[code],
    timestamp: new Date().toISOString(),
    messages: messages,
    payload: results
  };

  // Return the response.
  return response;

}

/**
 * Construct an error response object.
 *
 * @param error The error to include in the response.
 * @param code The status code to be returned in the response.
 * @returns An error response object.
 */
export function buildErrorResponse<T> (
  error: Error | IServiceError | Sequelize.UniqueConstraintError | Sequelize.ValidationError,
  code: number = 500
): IResponse<T> {

  // Convert sequelize related error to service error.
  if (error.hasOwnProperty('errors')) {

    // Establish the rest code 422 (unprocessable entity) in a new error.
    const newError = buildServiceErrorDirect(422, 'Database query error');

    // Get the sequelize errors and put them into the details.
    for (const sequelizeError of (<Sequelize.UniqueConstraintError>error).errors) {
      const errorInfo = unpackSequelizeErrors(sequelizeError.message);
      appendToServiceError(newError, errorInfo.code, errorInfo.message);
    }

    // Assign the new error to be returned.
    error = newError;

  }

  // Convert typical error to service error.
  if (!error['restCode']) {
    error = buildServiceErrorDirect(
      code,
      '',
      '',
      (<Error>error).name,
      (<Error>error).message,
    );
  }

  // Override code if required.
  code = (<IServiceError>error).restCode;

  // Return the response object.
  return <IResponse<T>>{
    id: uuidv4(),
    code: code,
    status: statuses[code],
    timestamp: new Date().toISOString(),
    errorInfo: error
  };

}
