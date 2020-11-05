/**
 * @packageDocumentation
 * @module endpoint
 */
import * as Bluebird from 'bluebird';
import {Request, Response} from 'express';
import {Body, JsonController, Post, Req, Res, UseBefore} from 'routing-controllers';
import {AuthErrorCodes} from '../../error-codes/auth';
import {Unauthorised} from '../../middleware/authentication';
import {authService} from '../../service/auth';
import {RequestValidationHelper} from '../../utilities/request';
import {sendErrorResponse, sendResultsResponse} from '../../utilities/response';

// TODO Feature: Add more auth end points for handling password resets.

// TODO Feature: Add tests for end point.

// TODO Move API docs to separate files.

// TODO Fix errors and examples in docs.

/**
 * Controller for authentication.
 */
@JsonController('/auth')
export class AuthController {

  /**
   * Manage request to log in.
   *
   * @param req The request from the frontend.
   * @param res The response to be sent back.
   * @param body The required body of the response.
   * @returns A promise to handle sending back the response.
   *
   */
  @Post()
  @UseBefore(Unauthorised)
  public httpPostAuth (
    @Req() req: Request,
    @Res() res: Response,
    @Body({required: true}) body: {}
  ): Bluebird<void | Response> {
    return Bluebird.resolve()
    .then(
      () => {
        const requestValidationHelper = new RequestValidationHelper(AuthErrorCodes, 'Unable to authenticate', req);
        requestValidationHelper.isNotAnEmptyString('email', 'ERRAUTH000');
        requestValidationHelper.isNotAnEmptyString('passsword', 'ERRAUTH001');
        requestValidationHelper.isNotAnEmptyString('tenant', 'ERRAUTH002');
        requestValidationHelper.validate();
      }
    )
    .then(
      () => authService.attemptAuthentication(body)
    )
    .then(
      (token: string) => sendResultsResponse(res, req, {result: token})
    )
    .catch(
      (err: Error) => sendErrorResponse(res, err)
    );
  }

}
