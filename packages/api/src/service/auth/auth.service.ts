/**
 * @packageDocumentation
 * @module service
 */
import * as Bluebird from 'bluebird';
import {config} from '../../config';
import {User} from '../../model/user';
import {buildServiceError, IServiceError} from '../../utilities/response';
import {jwtService} from '../jwt';
import {userService} from '../user';

/**
 * Service class for handling authorisation related actions.
 */
export class AuthService {

  /**
   * Errors to throw when authenticating.
   */
  private authErrors = new Map<String, IServiceError>(
    [
      ['no-email', buildServiceError('no-email-provided', 'Email not provided', 400)],
      ['no-password', buildServiceError('no-password-provided', 'Password not provided', 400)],
      ['no-tenant', buildServiceError('no-tenant-provided', 'Tenant not provided', 400)],
      ['attempts-exceeded', buildServiceError('login-attempts-exceeded', 'User has attempted to log in too many times', 429)],
      ['user-not-found', buildServiceError('user-not-found', 'No user with matching e-mail and password found', 404)]
    ]
  );

  /**
   * Attempt to authenticate a user with provided credentials.
   *
   * @param body A request containing authentication information.
   * @returns A promise which returns the token as a string.
   */
  public attemptAuthentication (body: {}): Bluebird<string> {

    // Get variables from body.
    for (const field in ['email', 'password', 'tenant']) {
      if (!body[field]) {
        throw this.authErrors[`no-${field}`];
      }
    }
    const email = body['email'];
    const password = body['password'];
    const tenant = body['tenant'];

    // Check user has not exceeded log in attempts
    return userService.getLoginAttempts(email)
    .then(
      (attempts: number) => {
        if (attempts >= config.accountSecurity.attemptsLimit) {
          throw this.authErrors['attempts-exceeded'];
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
              throw this.authErrors['user-not-found'];
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
                  throw this.authErrors['user-not-found'];
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
