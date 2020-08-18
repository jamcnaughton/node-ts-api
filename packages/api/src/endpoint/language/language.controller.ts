/**
 * @packageDocumentation
 * @module endpoint
 */
import * as Bluebird from 'bluebird';
import {
  Request,
  Response
} from 'express';
import {
  Get,
  JsonController,
  Req,
  Res
} from 'routing-controllers';
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
   * @param _ The request from the front end.
   * @param res The response to send back to the front end.
   * @param tenant The tenant the languages to return must belong to.
   * @returns A promise which attempts to find all the languages available.
   *
   * @api {get} /languages List Languages
   * @apiName httpGetLanguagesForTenant
   * @apiGroup Languages
   * @apiPermission anyone
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   *  {
   *    "state": "ok",
   *    "code": 200,
   *    "messages": [],
   *    "result": {
   *       "languages": [
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
  @Get()
  public httpGetLanguagesForTenant (
    @Req() _: Request,
    @Res() res: Response,
    @Tenant() tenant: string
  ): Bluebird<Response> {

    // Returns a promise which attempts to find the languages affiliated with the unit.
    return languageService.read(tenant)
    .then(
      (languages: Language[]) => sendResultsResponse(res, {languages: languages})
    )
    .catch(
      (err: Error) => sendErrorResponse(res, err)
    );

  }

}
