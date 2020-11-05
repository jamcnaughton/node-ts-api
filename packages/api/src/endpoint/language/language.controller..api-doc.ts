/**
 * @packageDocumentation
 * @module endpoint
 */

/**
 * @api {get} /language List Languages
 * @apiName httpGetLanguagesForTenant
 * @apiDescription Get the languages for a specific unit.
 * @apiGroup Language
 * @apiPermission anyone
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "id": "9a01e493-8792-4bd9-836a-effbcc1c7649",
 *    "timestamp": "2020-01-01T00:00:00.000Z",
 *    "status": "ok",
 *    "code": 200,
 *    "messages": [],
 *    "payload": {
 *       "results": [
 *         {
 *           "id": "b323d839-ad16-4e0a-b3e2-c552955d1ff5",
 *           "name": "Pirate",
 *           "code": "ar-ha"
 *         }
 *       ]
 *     }
 *  }
 *
 */
