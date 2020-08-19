/**
 * @packageDocumentation
 * @module endpoint
 */
import * as Bluebird from 'bluebird';
import {Request, Response} from 'express';
import {Body, JsonController, Post, Req, Res, UseBefore} from 'routing-controllers';
import {Unauthorised} from '../../middleware/authentication';
import {authService} from '../../service/auth';
import {sendErrorResponse, sendResultsResponse} from '../../utilities/response';

// TODO Feature: Add more auth end points for handling sign ups and password resets.

// TODO Feature: Add tests for end point.

// TODO Api Docs

/**
 * Controller for authentication.
 */
@JsonController('/auth')
export class AuthController {

    /**
     * @api {post} /auth Authenticate
     * @apiName PostAuth
     * @apiGroup Auth
     *
     * @apiParam {String} email Users email.
     * @apiParam {String} password Users password.
     * @apiParam {String} [tenant] Users tenant.
     *
     * @apiSuccess {String} accessToken JWT token.
     *
     * @apiParamExample {json} Request-Example:
     *     {
     *       "email": "user@demo.com",
     *       "password": "Passw0rd123",
     *       "tenant": "demo",
     *     }
     *
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
     *     }
     */
  /**
   * Manage request to log in.
   *
   * @param _ The request from the frontend.
   * @param res The response to be sent back.
   * @param body The required body of the response.
   * @returns A promise to handle sending back the response.
   */
  @Post()
  @UseBefore(Unauthorised)
  public httpPostAuth (
    @Req() _: Request,
    @Res() res: Response,
    @Body({required: true}) body: {}
  ): Bluebird<void | Response> {
    return authService.attemptAuthentication(body)
    .then(
      (token: string) => sendResultsResponse(res, {token: token})
    )
    .catch(
      (err: Error) => sendErrorResponse(res, err)
    );
  }

}
