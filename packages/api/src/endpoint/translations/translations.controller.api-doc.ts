/**
 * @packageDocumentation
 * @module endpoint
 */

/**
 * @api {get} /translation/signin List front end sign-in Translations
 * @apiName httpGetFrontEndSignInTranslations
 * @apiDescription Get front-end translations for the sign-in pages.
 * @apiGroup Translation
 * @apiPermission anyone
 *
 * @apiParam {string} tenant The tenant to get translations for.
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "id": "014108d8-f8e0-427a-9656-5c2fcdaa50a9",
 *    "timestamp": "2020-01-01T00:00:00.000Z",
 *    "status": "ok",
 *    "code": 200,
 *    "messages": [],
 *    "payload": {
 *      "result": {
 *        "a18a3a65-7e1e-474c-8ff2-f917b26f1614": {
 *          "title.sign-in": "Sign in",
 *          ...
 *        }
 *      }
 *    }
 *  }
 *
 * @apiError ERRTRANS000 tenant is either missing or an empty string
 *
 */

/**
 * @api {get} /translation/tenant List front end tenant Translations
 * @apiName httpGetFrontEndTenantTranslations
 * @apiDescription Get front-end translations for the non-sign-in pages.
 * @apiGroup Translation
 * @apiPermission user, admin
 *
 * @apiParam {languageId} The ID of the language to get translations for.
 * @apiParam {string} tenant The tenant to get translations for.
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "id": "014108d8-f8e0-427a-9656-5c2fcdaa50a9",
 *    "timestamp": "2020-01-01T00:00:00.000Z",
 *    "status": "ok",
 *    "code": 200,
 *    "messages": [],
 *    "payload": {
 *      "result": {
 *        "a18a3a65-7e1e-474c-8ff2-f917b26f1614": {
 *          "title.welcome": "Welcome!",
 *          ...
 *        }
 *      }
 *    }
 *  }
 *
 * @apiError ERRTRANS001 languageId is either missing or is not a valid GUID
 *
 */
