/**
 * @packageDocumentation
 * @module config
 */

/**
 * An interface representing an object containing general configuration information.
 */
export interface IConfig {

  /**
   * Object containing city information.
   */
  cities: ICity[];

  /**
   * Object containing CORS configuration information.
   */
  cors: ICorsConfig;

  /**
   * The URL of the external API.
   */
  externalApiUrl: string;

}

/**
 * An interface representing an object containing CORS configuration information.
 */
export interface ICorsConfig {

  /**
   * The permitted origin(s) which sends requests to the API.
   */
  origins: string;

  /**
   * The permitted request header(s) to the API.
   */
  headers: string;

  /**
   * The permitted request methods(s) to the API.
   */
  methods: string;

}

/**
 * An interface representing an object containing city information.
 */
export interface ICity {

  /**
   * The city's name.
   */
  name: string;

  /**
   * The city's latitude.
   */
  latitude: number;

  /**
   * The city's latitude.
   */
  longitude: number;

}
