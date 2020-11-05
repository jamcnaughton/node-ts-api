/**
 * @packageDocumentation
 * @module utilities
 */
import {Request, Response} from 'express';
import * as Sequelize from 'sequelize';
import {TenantErrorCodes} from '../../error-codes/tenants';
import {logService} from '../../service/log';
import {buildServiceError, IServiceError} from '../service-error';
import {buildErrorResponse, buildResultsResponse, IResponsePayload} from './response.interface';

/**
 * Prepare a structured response containing results.
 *
 * @param res The response object.
 * @param req The request object.
 * @param results The part of the response containing the payload.
 * @param code The REST status code the response should have.
 * @param status The readable status the response should have.
 * @param messages The message to include in the response.
 * @returns A structured response object.
 */
export function sendResultsResponse<T> (
    res: Response,
    req: Request,
    results: IResponsePayload<T>,
    code: number = 200,
    status: string = null,
    messages: string[] = []
): Response {

  // Make the structured response.
  const response = buildResultsResponse(results, code, status, messages);

  // Add pagination details if required.
  if (results && results.paginatedResults) {
    const total = results.paginatedResults.count;
    const pageSize = +<string>(req.query.pageSize);
    const pageNumber = +<string>(req.query.pageNumber);
    const pageCount: number = total > 0 ? Math.ceil(total / pageSize) : 0;
    response.payload.paginatedResults.details = {
      pageCount: pageCount,
      pageNumber: pageNumber,
      pageSize: pageSize,
      total: total
    };
  }

  // Return the response with the error details in it.
  return res.status(code).json(response);

}

/**
 * Prepare a structured response containing error details.
 *
 * @param res The response object.
 * @param error The message to include in the response.
 * @param status The REST status code the response should have.
 * @returns A structured response object.
 */
export function sendErrorResponse (
  res: Response,
  error: Error | IServiceError | Sequelize.UniqueConstraintError | Sequelize.ValidationError,
  status: number = 500
): Response {

  // Build service error for this being a tenant error if required.
  if (res.getHeader('Tenant-Error')) {
    error = buildServiceError(
      400,
      'Request made for invalid tenant',
      'ERRTENANTS000',
      TenantErrorCodes
    );
  }

  // Output error information (if not test).
  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
    if (error['stack']) {
      logService.logger.error(error['stack']);
    }
  }

  // Make the error response.
  const errorResponse = buildErrorResponse(error, status);

  // Return the response with the error details in it.
  return res.status(errorResponse.code).json(errorResponse);

}
