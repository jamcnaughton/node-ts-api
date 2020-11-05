/**
 * @packageDocumentation
 * @module service
 */
import * as Bluebird from 'bluebird';
import {config} from '../../config';
import {AuthErrorCodes} from '../../error-codes/auth';
import {User} from '../../model/user';
import {buildServiceError} from '../../utilities/service-error';
import {jwtService} from '../jwt';
import {userService} from '../user';

/**
 * Service class for handling authorisation related actions.
 */
export class AuthService {

  /**
   * Attempt to authenticate a user with provided credentials.
   *
   * @param body A request containing authentication information.
   * @returns A promise which returns the token as a string.
   */
  public attemptAuthentication (body: {}): Bluebird<string> {

    // Get variables from body.
    const email = body['email'];
    const password = body['password'];
    const tenant = body['tenant'];

    // Check user has not exceeded log in attempts
    return userService.getLoginAttempts(email)
    .then(
      (attempts: number) => {
        if (attempts >= config.accountSecurity.attemptsLimit) {
          throw buildServiceError(429, 'Unable to authenticate', 'ERRAUTH004', AuthErrorCodes);
        }
      }
    )

    // Attempt to authenticate the user.
    .then(
      () => userService.authenticate(email, tenant)
    )
    .then(
      (user: User) => {

        // If no valid user is supplied return an error.
        if (!user) {
          return userService.setFailedAttempt(email)
          .then(
            () => {
              throw buildServiceError(401, 'Unable to authenticate', 'ERRAUTH003', AuthErrorCodes);
            }
          );
        }

        // Return a promise which authenticates the user.
        return user.verifyPassword(password, user.password)
        .then(
          (authenticated: boolean) => {

            // Verify the password.
            if (!authenticated) {

              // Return an error if the user is not authenticated at this point.
              return userService.setFailedAttempt(user.email)
              .then(
                () => {
                  throw buildServiceError(401, 'Unable to authenticate', 'ERRAUTH003', AuthErrorCodes);
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
                    tenant: tenant
                  }
                )
              );

            }

          }
        );

      }
    );

  }

}

/**
 * A service which handles interactions relating to authentication.
 */
export const authService: AuthService = new AuthService();
