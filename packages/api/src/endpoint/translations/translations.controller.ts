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
   * @param req The request from the front end.
   * @param res The response to send back to the front end.
   * @param tenant The tenant the translations to return must belong to.
   * @returns A promise which attempts to get all the relevant translations.
   */
  @Get(`/signin/:tenant`)
  public httpGetFrontEndSignInTranslations (
    @Req() req: Request,
    @Res() res: Response,
    @Param('tenant') tenant: string,
  ): Bluebird<Response> {
    return Bluebird.resolve()
    .then(
      () => {
        const requestValidationHelper = new RequestValidationHelper(TranslationErrorCodes, 'Unable to get translations for tenant', req);
        requestValidationHelper.isGuid('tenant', 'ERRTRANS000', ParamType.Route);
        requestValidationHelper.validate();
      }
    )
    .then(
      () => translationService.readFrontEndSignInTranslations(tenant)
    )
    .then(
      (translations: {}) => sendResultsResponse(res, req, {result: translations})
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
        requestValidationHelper.isGuid('languageId', 'ERRTRANS001', ParamType.Route);
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
