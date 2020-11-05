/**
 * @packageDocumentation
 * @module utilities
 */

/**
 * An interface representing objects containing pagination attributes.
 */
export interface IPaginationAttributes {

  /**
   * The maximum number of data records per page.
   */
  limit: number;

  /**
   * The number of data records before those to be shown in this page.
   */
  offset: number;

}
