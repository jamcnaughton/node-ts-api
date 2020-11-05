/**
 * @packageDocumentation
 * @module decorators
 */
import {
  Request,
  Response
} from 'express';
import {
  Action,
  createParamDecorator
} from 'routing-controllers';
import {IJwtAttributes} from '../../model/jwt';
import {jwtService} from '../../service/jwt';
import {redisService} from '../../service/redis';

/**
 * Decorator function for tenant strings which checks that it is a valid tenant.
 *
 * @returns A function which checks the validity of the tenant.
 */
export function Tenant (): Function {

  // Returns a custom parameter decorator that check the tenant's validity.
  return createParamDecorator({
    required: true,
    value: (action: Action): Promise<string | void> => {

      // Get request and response.
      const req: Request = action.request;
      const res: Response = action.response;

      // Define tenant string.
      let tenant: string;

      if (req.query && req.query.tenant) {
        tenant = <string>(req.query.tenant);
      }
      if (req.body && req.body.tenant) {
        tenant = req.body.tenant;
      }

      // Return a promise which checks the supplied token is valid and gets the tenant from there.
      return jwtService
        .readToken(req)
        .then(
          (token: IJwtAttributes) => token
        )
        .catch(
          () => null
        )
        .then(
          (token: IJwtAttributes) => {

            // Get tenant from token.
            if (token) {
              tenant = token.tenant;
            }

            // Return an error if there is no tenant.
            if (!tenant) {
              res.append('Tenant-Error', 'invalidtenant');
              tenant = 'invalidtenant';
            }

            // Return a promise which checks the tenant is in the Redis data store.
            return redisService
              .read('tenants')
              .then(
                (tenants: string) => {

                  // Return an error if tenant isn't in the Redis data store.
                  if (tenants && !tenants.includes(tenant)) {
                    res.append('Tenant-Error', 'invalidtenant');
                    tenant = 'invalidtenant';
                  }

                  // Returns the valid tenant.
                  return tenant;

                }
              );

          }
        );

    }
  });

}
