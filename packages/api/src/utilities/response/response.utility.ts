/**
 * @packageDocumentation
 * @module utilities
 */
import {Response} from 'express';
import {logService} from '../../service/log';
import {buildErrorResponse, buildResponse} from './response.interface';
import {IServiceError} from './service-error.interface';

/**
 * Prepare a structured response containing results.
 *
 * @param res The response object.
 * @param results The part of the response containing the payload.
 * @param code The REST status code the response should have.
 * @param status The readable status the response should have.
 * @param messages The message to include in the response.
 * @returns A structured response object.
 */
export function sendResultsResponse (
    res: Response,
    results: {},
    code: number = 200,
    status: string = null,
    messages: string[] = []
): Response {

  // Make the structured response.
  const response = buildResponse(results, code, status, messages);

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
  error: Error | IServiceError,
  status: number = 500
): Response {

  // Output stack traces.
  if (error['stack']) {
    logService.logger.error(error['stack']);
  }

  // Make the error response.
  const errorResponse = buildErrorResponse(error, status);

  // Return the response with the error details in it.
  return res.status(errorResponse.code).json(errorResponse);

}
