/**
 * @packageDocumentation
 * @module middleware
 */
import {NextFunction, Request, Response} from 'express';
import {ExpressMiddlewareInterface} from 'routing-controllers';
import {buildServiceError, sendErrorResponse} from '../../utilities/response';

/**
 * Class for checking that a user making a request is authorised.
 */
export class Unauthorised implements ExpressMiddlewareInterface {

  /**
   * Check that an incoming request is from an authorised user.
   *
   * @param req The user request.
   * @param res The response to be sent back to the user.
   * @param next Call back to be called if user is authorised.
   * @returns Nothing or an error response to inform the user they are unauthorised.
   */
  public use (req: Request, res: Response, next: NextFunction): void | Response {

    // If the user is unauthorised then return an error response.
    if (req.headers.authorization) {

      const serviceError = buildServiceError('unautorised', 'You are not authorised to access this resource', 401);
      return sendErrorResponse(res, serviceError);
    }

    // Call the call back.
    next();

  }

}
