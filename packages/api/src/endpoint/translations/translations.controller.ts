/**
 * @packageDocumentation
 * @module endpoint
 */
import * as Bluebird from 'bluebird';
import {Request, Response} from 'express';
import {Authorized, Get, JsonController, Param, Req, Res} from 'routing-controllers';
import {Tenant} from '../../decorators/tenant';
import {translationService} from '../../service/translation';
import {sendErrorResponse, sendResultsResponse} from '../../utilities/response';

// TODO Feature: Add tests for end point.

// TODO ApiDocs

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
   */
  @Get(`/signin/:tenant`)
  public httpGetFrontEndSignInTranslations (
    @Req() _: Request,
    @Res() res: Response,
    @Param('tenant') tenant: string,
  ): Bluebird<Response> {
    return translationService.readFrontEndSignInTranslations(tenant)
    .then(
      (translations: {}) => sendResultsResponse(res, {translations: translations})
    )
    .catch(
      (err: Error) => sendErrorResponse(res, err)
    );
  }

  /**
   * Get front-end translations for the reference pages.
   *
   * @param _ The request from the front end.
   * @param res The response to send back to the front end.
   * @param tenant The tenant the translations to return must belong to.
   * @returns A promise which attempts to get all the relevant translations.
   */
  @Get(`/reference/:tenant`)
  public httpGetFrontEndReferenceTranslations (
    @Req() _: Request,
    @Res() res: Response,
    @Param('tenant') tenant: string,
  ): Bluebird<Response> {
    return translationService.readFrontEndReferenceTranslations(tenant)
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
   * @param _ The request from the front end.
   * @param res The response to send back to the front end.
   * @param tenant The tenant the translations to return must belong to.
   * @returns A promise which attempts to get all the relevant translations.
   */
  @Authorized(['user', 'admin'])
  @Get(`/tenant/:languageid`)
  public httpGetFrontEndTenantTranslations (
    @Req() _: Request,
    @Res() res: Response,
    @Param('languageid') languageId: string,
    @Tenant() tenant: string
  ): Bluebird<Response> {
    return translationService.readFrontEndTenantTranslations(languageId, tenant)
    .then(
      (translations: {}) => sendResultsResponse(res, {translations: translations})
    )
    .catch(
      (err: Error) => sendErrorResponse(res, err)
    );
  }

}
