/**
 * @module endpoint
 */
import * as Bluebird from 'bluebird';
import {Request, Response} from 'express';
import {Get, JsonController, Param, Req, Res} from 'routing-controllers';
import {config} from '../../config';
import {Person} from '../../model/person';
import {peopleService} from '../../service/people';
import {buildErrorResponse, errorResponse, resultsResponse, ServiceError} from '../../utilities/response';

/**
 * A class which handles requests relating to people.
 */
@JsonController('/people')
export class PeopleController {

  /**
   * Respond to a request to get people in and within a supplied distance of a specified city.
   *
   * @param _ The request from the front end.
   * @param res The response to send back to the front end.
   * @param city The city to get people in and nearby to.
   * @param distance How many miles is considered nearby to the target city.
   * @returns A promise which attempts to produce a response containing the relevant people.

   * @api {get} /people/near/:city/within/:distance Get Near City
   * @apiName httpGetNearCity
   * @apiGroup People
   *
   * @apiParam {String} city The city to get people in and nearby to.
   * @apiParam {Number} distance How many miles is considered nearby to the target city.
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   *  {
   *    "state": "ok",
   *    "code": 200,
   *    "messages": [],
   *    "result": {
   *      "people": [
   *        {
   *          "id": 135,
   *          "first_name": "Mechelle",
   *          "last_name": "Boam",
   *          "email": "mboam3q@thetimes.co.uk",
   *          "ip_address": "113.71.242.187",
   *          "latitude": -6.5115909,
   *          "longitude": 105.652983
   *        },
   *        {
   *          "id": 396,
   *          "first_name": "Terry",
   *          "last_name": "Stowgill",
   *          "email": "tstowgillaz@webeden.co.uk",
   *          "ip_address": "143.190.50.240",
   *          "latitude": -6.7098551,
   *          "longitude": 111.3479498
   *        }
   *      ]
   *     }
   *  }
   *
   */
  @Get(`/near/:city/within/:distance`)
  public httpGetNearCity (
    @Req() _: Request,
    @Res() res: Response,
    @Param('city') city: string,
    @Param('distance') distance: string
  ): Bluebird<Response> {

    // Establish array for holding any validation errors.
    const validationErrors: ServiceError[] = [];

    // Check city is supplied.
    if (city === null) {
      validationErrors.push(
        {
          errorCode: 'CITY001',
          errorString: 'City not supplied in request.'
        }
      );
    } else {
      if (!config.cities.find(c => c.name === city)) {
        validationErrors.push(
          {
            errorCode: 'CITY002',
            errorString: 'City supplied in request is not currently supported.'
          }
        );
      }
    }

    // Check distance supplied and is a number.
    if (distance === null) {
      validationErrors.push(
        {
          errorCode: 'CITY003',
          errorString: 'Distance not supplied in request.'
        }
      );
    } else {
      if (isNaN(+distance)) {
        validationErrors.push(
          {
            errorCode: 'CITY004',
            errorString: 'Distance supplied in request is not a number.'
          }
        );
      }
    }

    // Return an error if the request was not correct.
    try {
      if (validationErrors.length > 0) {
        throw buildErrorResponse(400, validationErrors, res);
      }
    } catch (err) {
      return Bluebird.resolve(err);
    }

    // Returns a promise which attempts to produce a response containing the specified group's information.
    return peopleService.nearCity(city, +distance)
    .then(
      (people: Person[]) => resultsResponse(res, {people})
    )
    .catch(
      (err: Error) => errorResponse(res, err)
    );
  }

}
