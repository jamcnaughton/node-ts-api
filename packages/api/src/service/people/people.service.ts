/**
 * @packageDocumentation
 * @module service
 */
import * as Bluebird from 'bluebird';
import * as haversine from 'haversine';
import {config} from '../../config';
import {ICity} from '../../config/config.interface';
import {Person} from '../../model/person';

/**
 * Service class for handling people related actions.
 */
export class PeopleService {

  /**
   * Get people in and within a supplied distance of a specified city.
   *
   * @param city The city to get people in and nearby to.
   * @param distance How many miles is considered nearby to the target city.
   * @returns A promise which attempts to produce a response containing the relevant people.
   */
  public nearCity (city: string, distance: number): Bluebird<Person[]> {

    // Create array of promises to query external API.
    const queryExernalApiPromises: Bluebird<void>[] = [];

    // Establish arrays to hold people in.
    let cityPeople: Person[] = [];
    let allPeople: Person[] = [];

    // Create promise to get people from city via the external API.
    queryExernalApiPromises.push(
      this.getPeopleInCity(city)
      .then(
        (people: Person[]) => {
          cityPeople = people;
        }
      )
    );

    // Create promise to get all people via the external API.
    queryExernalApiPromises.push(
      this.getAllPeople()
      .then(
        (people: Person[]) => {
          allPeople = people;
        }
      )
    );

    // Execute the promises.
    return Bluebird.all(queryExernalApiPromises)
    .then(
      () => {

        // Get city's lat/long from config.
        const configCity: ICity = config.cities.find(c => c.name === city);
        const cityLatitude = configCity.latitude;
        const cityLongitude = configCity.longitude;

        // Filter out users in the city.
        const outsideCityPeople = allPeople.filter(
          (person) => {
            return cityPeople.findIndex(
              (cityPerson) => cityPerson.id === person.id
            ) === -1;
          }
        );

        // Filter out users which are not nearby.
        const relevantNearbyUsers = outsideCityPeople.filter(
          (user) => {

            // Get the distance between the co-ordinates using the haversine formula.
            const distanceFromCity = haversine(
              {
                latitude:  user.latitude,
                longitude: user.longitude
              },
              {
                latitude:  cityLatitude,
                longitude: cityLongitude
              },
              {
                unit: 'mile'
              }
            );
            return distanceFromCity < distance;
          }
        );

        // Combine lists of users.
        const nearbyPeople: Person[] = [];
        for (const user of cityPeople) {
          nearbyPeople.push(user);
        }
        for (const user of relevantNearbyUsers) {
          nearbyPeople.push(user);
        }

        // Return the nearby users.
        return nearbyPeople;

      }
    );

  }

  /**
   * Make a call to the external API to get people in a city.
   *
   * @param city The city to get people for.
   * @returns A promise to get people.
   */
  private getPeopleInCity (city: string): Bluebird<Person[]> {

    return Bluebird.resolve()
    .then(
      () => fetch(`${config.externalApiUrl}/city/${city}/users`)
      .then(
        (response: Response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json() as Promise<Person[]>;
        }
      )
    );
  }

  /**
   * Make a call to the external API to get all people.
   *
   * @returns A promise to get people.
   */
  private getAllPeople (): Bluebird<Person[]> {
    return Bluebird.resolve()
    .then(
      () => fetch(`${config.externalApiUrl}/users`)
      .then(
        (response: Response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json() as Promise<Person[]>;
        }
      )
    );
  }

}

/**
 * A service which handles interactions with other APIs to get people information.
 */
export const peopleService: PeopleService = new PeopleService();
