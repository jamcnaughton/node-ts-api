/**
 * @packageDocumentation
 * @module endpoint
 */
import * as Bluebird from 'bluebird';
import {Request, Response} from 'express';
import {Authorized, Get, JsonController, Param, Req, Res} from 'routing-controllers';
import {Tenant} from '../../decorators/tenant';
import {TranslationErrorCodes} from '../../error-codes/translation';
import {translationService} from '../../service/translation';
import {ParamType, RequestValidationHelper} from '../../utilities/request';
import {sendErrorResponse, sendResultsResponse} from '../../utilities/response';

// TODO Feature: Add tests for end point.

/**
 * A class which handles requests relating to text items.
 */
@JsonController('/translation')
export class TranslationController {

  /**
   * Get front-end translations for the sign-in pages.
   *
   * @param _ The request from the front end.
   * @param res The response to send back to the front end.
   * @param tenant The tenant the translations to return must belong to.
   * @returns A promise which attempts to get all the relevant translations.
   *
   * @api {get} /translation/signin List front end sign-in Translations
   * @apiName httpGetFrontEndSignInTranslations
   * @apiGroup Translation
   * @apiPermission anyone
   *
   * @apiParam {string} tenant The tenant to get translations for.
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   *  {
   *    "state": "ok",
   *    "code": 200,
   *    "messages": [],
   *    "result": {
   *       "translations": [
   *         {
   *            "id": "4edff859-bded-4dab-a007-e51b50ab5c86",
   *            "data": "Example translation",
   *            "languageId": "05521bf7-3d55-4089-a3a0-f91f92ea485f",
   *            "translationKey": "example-translation",
   *            "frontendSignIn": true
   *            "frontendTenant": false
   *         },
   *         ...
   *       ]
   *     }
   *  }
   *
   */
  @Get(`/signin/:tenant`)
  public httpGetFrontEndSignInTranslations (
    @Req() _: Request,
    @Res() res: Response,
    @Param('tenant') tenant: string,
  ): Bluebird<Response> {
    return Bluebird.resolve()

    // TODO Add validation and example error codes.
    .then(
      () => translationService.readFrontEndSignInTranslations(tenant)
    )
    .then(
      (translations: {}) => sendResultsResponse(res, {translations: translations})
    )
    .catch(
      (err: Error) => sendErrorResponse(res, err)
    );
  }

  /**
   * Get front-end translations for the non-sign-in pages.
   *
   * @param req The request from the front end.
   * @param res The response to send back to the front end.
   * @param languageId The ID of the language to get translations for.
   * @param tenant The tenant the translations to return must belong to.
   * @returns A promise which attempts to get all the relevant translations.
   *
   * @api {get} /translation/tenant List front end tenant Translations
   * @apiName httpGetFrontEndTenantTranslations
   * @apiGroup Translation
   * @apiPermission user, admin
   *
   * @apiParam {languageId} The ID of the language to get translations for.
   * @apiParam {string} tenant The tenant to get translations for.
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   *  {
   *    "state": "ok",
   *    "code": 200,
   *    "messages": [],
   *    "result": {
   *       "translations": [
   *         {
   *            "id": "4edff859-bded-4dab-a007-e51b50ab5c86",
   *            "data": "Example translation",
   *            "languageId": "05521bf7-3d55-4089-a3a0-f91f92ea485f",
   *            "translationKey": "example-translation",
   *            "frontendSignIn": false
   *            "frontendTenant": true
   *         },
   *         ...
   *       ]
   *     }
   *  }
   *
   */
  @Authorized(['user', 'admin'])
  @Get(`/tenant/:languageid`)
  public httpGetFrontEndTenantTranslations (
    @Req() req: Request,
    @Res() res: Response,
    @Param('languageid') languageId: string,
    @Tenant() tenant: string
  ): Bluebird<Response> {
    return Bluebird.resolve()
    .then(
      () => {
        const requestValidationHelper = new RequestValidationHelper(TranslationErrorCodes, 'Unable to get translations for language', req);
        requestValidationHelper.isGuid('languageId', 'ERRTRANS000', ParamType.Route);
        requestValidationHelper.validate();
      }
    )
    .then(
      () => translationService.readFrontEndTenantTranslations(languageId, tenant)
    )
    .then(
      (translations: {}) => sendResultsResponse(res, req, {result: translations})
    )
    .catch(
      (err: Error) => sendErrorResponse(res, err)
    );
  }

}
