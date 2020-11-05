/**
 * @packageDocumentation
 * @module endpoint
 */

/**
 * @api {post} /auth Authenticate
 * @apiName httpPostAuth
 * @apiDescription Manage request to log in.
 * @apiGroup Auth
 *
 * @apiParam {Object} body Contains an email, password and tenant to try authenticating.
 *
 * @apiSuccess {String} JWT token.
 *
 * @apiParamExample {json} Request-Example:
 *   {
 *     "email": "user@demo.com",
 *     "password": "Passw0rd123",
 *     "tenant": "demo",
 *   }
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *  {
 *    "id": "100a444d-c9a5-4435-81af-11d5fa44bd32",
 *    "timestamp": "2020-01-01T00:00:00.000Z",
 *    "status": "ok",
 *    "code": 200,
 *    "messages": [],
 *    "payload": {
 *      "result": "dgdfgDFGDFGDfgdfRTbjghjghjGHJGHJ..."
 *    }
 *  }
 *
 * @apiError ERRAUTH000 email is either missing or an empty string
 * @apiError ERRAUTH001 password is either missing or an empty string
 * @apiError ERRAUTH002 tenant is either missing or an empty string
 * @apiError EERRAUTH003 email address and password combination failed
 * @apiError EERRAUTH004 user is locked out - login attempts limit exceeded
 *
 */
