/**
 * @packageDocumentation
 * @module endpoint
 */
import * as Bluebird from 'bluebird';
import {Request, Response} from 'express';
import {Get, JsonController, Req, Res} from 'routing-controllers';
import {Tenant} from '../../decorators/tenant';
import {Language} from '../../model/language';
import {languageService} from '../../service/language';
import {sendErrorResponse, sendResultsResponse} from '../../utilities/response';

/**
 * A class which handles requests relating to languages.
 */
@JsonController('/language')
export class LanguageController {

  /**
   * Get the languages for a specific unit.
   *
   * @param req The request from the front end.
   * @param res The response to send back to the front end.
   * @param tenant The tenant the languages to return must belong to.
   * @returns A promise which attempts to find all the languages available.
   */
  @Get()
  public httpGetLanguagesForTenant (
    @Req() req: Request,
    @Res() res: Response,
    @Tenant() tenant: string
  ): Bluebird<Response> {
    return Bluebird.resolve()
    .then(
      () => languageService.read(tenant)
    )
    .then(
      (languages: Language[]) => sendResultsResponse(res, req, {results: languages})
    )
    .catch(
      (err: Error) => sendErrorResponse(res, err)
    );
  }

}
