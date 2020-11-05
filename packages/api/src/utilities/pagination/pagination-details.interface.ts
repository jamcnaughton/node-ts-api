/**
 * @packageDocumentation
 * @module utilities
 */

/**
 * An interface representing details on pagination in the response results.
 */
export interface IPaginationDetails {

  /**
   * The number of pages available.
   */
  pageCount: number;

  /**
   * The current page of results being returned.
   */
  pageNumber: number;

  /**
   * The number of results per page.
   */
  pageSize: number;

  /**
   * The number of results available.
   */
  total: number;

}
