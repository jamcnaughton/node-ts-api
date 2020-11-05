/**
 * @packageDocumentation
 * @module service
 */
import * as Bluebird from 'bluebird';
import {Request} from 'express';
import {sign, verify} from 'jsonwebtoken';
import {config} from '../../config';
import {JWTErrorCodes} from '../../error-codes/jwt';
import {IJwtAttributes} from '../../model/jwt';
import {buildServiceError} from '../../utilities/service-error';

/**
 * Service class for handling JWT related actions.
 */
export class JwtService {

  /**
   * Create a valid JWT.
   *
   * @param payload An object holding JWT attributes.
   * @returns A promise which builds the JWT and returns it.
   */
  public createToken (payload: IJwtAttributes): Bluebird<string> {

    // Returns a promise which builds the JWT and returns it.
    return new Bluebird(
      (resolve: Function, reject: Function): void => sign(
        payload,
        config.jwt.secret,
        {
          expiresIn: '60m'
        },
        (err: Error, token: string) => {
          if (err) {
            reject(err);
          } else {
            resolve(token);
          }
        }
      )
    );

  }

  /**
   * Get the token from a request.
   *
   * @param req The request to get the token from.
   * @returns A promise which retrieves the JWT.
   */
  public readToken (req: Request): Promise<Object> {

    // Returns a promise which retrieves the JWT.
    return new Promise(
      (resolve: Function): void => {

        // Check there is a JWT present, throw an error if not.
        if (!req.headers.hasOwnProperty('authorization')) {
          throw buildServiceError(401, 'Unable to authorize', 'ERRJWT000', JWTErrorCodes);
        }

        // Get the token from the headers.
        // @ts-ignore
        const token: string[] = req.headers.authorization.split(' ');

        // Check the token length is valid.
        if (token.length !== 2) {
          throw buildServiceError(401, 'Unable to authorize', 'ERRJWT002', JWTErrorCodes);
        }

        // Check the token structure is valid.
        return resolve(token[1]);

      })
      .then(
        (token: string) => this.tokenInfo(token)
      );

  }

  /**
   * Get information from a JWT.
   *
   * @param token The JWT to get information from.
   * @returns A promise which gets an object containing the JWT attributes.
   */
  public tokenInfo (token: string): Promise<IJwtAttributes | {}> {

    // Returns a promise which gets an object containing the JWT attributes.
    return new Promise(
      (resolve: Function, reject: Function): void => {
        return verify(
          token,
          config.jwt.secret,
          (err: Error, props: IJwtAttributes) => {
            if (err) {
              reject(err);
            } else {
              resolve(props);
            }
          }
        );
      }
    );

  }

}

/**
 * A service which handles JWTs.
 */
export const jwtService: JwtService = new JwtService();
