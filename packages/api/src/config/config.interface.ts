/**
 * @packageDocumentation
 * @module config
 */

/**
 * An interface representing an object containing general configuration information.
 */
export interface IConfig {

  /**
   * Object containing account security configuration information.
   */
  accountSecurity: IAccountSecurityConfig;

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
   * Object containing JWT configuration information.
   */
  jwt: IJwtConfig;

}

/**
 * An interface representing an object containing account security configuration information.
 */
export interface IAccountSecurityConfig {

  /**
   * The number of attempts to unsuccessfully log in with the same e-mail allowed.
   */
  attemptsLimit: number;

  /**
   * The length of time a user should be locked out after reaching the limit on unsuccessful attempts to log in.
   */
  lockoutTime: number;

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
