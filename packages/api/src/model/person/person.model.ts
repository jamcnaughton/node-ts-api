/**
 * @packageDocumentation
 * @module model
 */

/**
 * A model which represents a person.
 */
export class Person {

  /**
   * A unique ID representing the person.
   */
  public id: string;

  /**
   * The user's first name.
   */
  public first_name: string;

  /**
   * The user's first name.
   */
  public last_name: string;

  /**
   * The user's email.
   */
  public email: string;

  /**
   * The user's email.
   */
  public ip_address: string;

  /**
   * The latitude of the user's location.
   */
  public latitude: number;

  /**
   * The longitude of the user's location.
   */
  public longitude: number;

}
