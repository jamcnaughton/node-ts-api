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
   * Object containing Redis configuration information.
   */
  redis: IRedisConfig;

  /**
   * Object containing sql configuration information.
   */
  sql: ISqlInterface;

  /**
   * The URL of the external API.
   */
  externalApiUrl: string;

  /**
   * Object containing JWT configuration information.
   */
  jwt: IJwtConfig;

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

/**
 * An interface representing an object containing Redis configuration information.
 */
export interface IRedisConfig {

  /**
   * The Redis instance address.
   */
  host: string;

  /**
   * The Redis instance port number.
   */
  port: number;

}

/**
 * An interface representing an object containing sql configuration information.
 */
export interface ISqlInterface {

  /**
   * The name of the sql database to access in the sql server.
   */
  database: string;

  /**
   * The type of sql database being used.
   */
  dialect: string;

  /**
   * The username for accessing the sql database.
   */
  username: string;

  /**
   * The hostname for the database.
   */
  host: string;

  /**
   * The password for accessing the sql database.
   */
  password: string;

  /**
   * Flag to set whether sql statements are just validated instead of being executed when actioned.
   */
  validateOnly: boolean;

  /**
   * Flag to set whether operator aliases are permitted.
   */
  operatorsAliases: boolean;

  /**
   * Options for the database.
   */
  dialectOptions: {

    /**
     * Flag to set whether search paths need to be prepended.
     */
    prependSearchPath: boolean;

    /**
     * Flag to set whether a SSL connection is required.
     */
    ssl: boolean;

  };

}

/**
 * An interface representing an object containing JWT configuration information.
 */
export interface IJwtConfig {

  /**
   * The length of time a JWT should be valid for.
   */
  duration: string;

  /**
   * The key used to sign JWTs with.
   */
  secret: string;

}
