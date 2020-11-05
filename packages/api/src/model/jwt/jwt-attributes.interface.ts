/**
 * @packageDocumentation
 * @module model
 */

/**
 * Interface representing objects holding JWT attributes.
 */
export interface IJwtAttributes {

  /**
   * The unique ID of the token.
   */
  id: string;

  /**
   * The email of the user.
   */
  email: string;

  /**
   * The roles of the user.
   */
  roles: string[];

  /**
   * The tenant the user affiliated with the token belongs to.
   */
  tenant: string;

}
