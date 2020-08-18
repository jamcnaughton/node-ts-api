/**
 * @module endpoint
 */
import * as Bluebird from 'bluebird';
import {Request, Response} from 'express';
import {Body, JsonController, Post, Req, Res, UseBefore} from 'routing-controllers';
import {config} from '../../config';
import {Unauthorised} from '../../middleware/authentication';
import {User} from '../../model/user';
import {jwtService} from '../../service/jwt';
import {userService} from '../../service/user';
import {buildServiceError, sendErrorResponse, sendResultsResponse} from '../../utilities/response';

/**
 * An interface for authorisation controller message contents to conform to.
 */
export interface IAuth {
  email: string;
  password: string;
  tenant?: string;
}

// TODO Add more auth end points for handling sign ups and password resets.

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
    @Body({
      required: true
    }) body: IAuth
  ): Bluebird<void | Response> {


    // Check user has not exceeded log in attempts
    return userService.getLoginAttempts(body.email)
    .then(
      (attempts: number) => {
        if (attempts >= config.accountSecurity.attemptsLimit) {
          throw buildServiceError('login-attempts-exceeded', 'User has attempted to log in too many times', 429);
        }
      }
    )

    // Attempt to the user.
    .then(
      () => userService.authenticate(body.email, body.tenant)
    )
    .then(
      (user: User) => {

        // If no valid user is supplied return an error.
        if (!user) {
          return userService.setFailedAttempt(body.email)
          .then(
            () => {
              throw buildServiceError('user-not-found', 'No user with matching e-mail and password found', 404);
            }
          );
        }

        // Return a promise which authenticates the user.
        return user.verifyPassword(body.password, user.password)
        .then(
          (authenticated: boolean) => {

            // Verify the password.
            if (!authenticated) {

              // Return an error if the user is not authenticated at this point.
              return userService.setFailedAttempt(user.email)
              .then(
                () => {
                  throw buildServiceError('user-not-found', 'No user with matching e-mail and password found', 404);
                }
              );

            } else {

              // Get roles.
              const roles: any[] = [];
              for (const role of user.roles) {
                roles.push(role.name);
              }

              // Return a promise which attempts to clear the users failed logins on successful login.
              return userService.clearFailedAttempts(user.email)
              .then(
                () => jwtService.createToken(
                  {
                    id: user.id,
                    email: user.email,
                    roles: roles,
                    tenant: body.tenant
                  }
                )
                .then(
                  (token: string) => sendResultsResponse(res, {token: token})
                )
              );
            }
          }
        );
      }
    )
    .catch(
      (err: Error) => sendErrorResponse(res, err)
    );
  }

}
