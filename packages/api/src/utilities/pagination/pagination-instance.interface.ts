/**
 * @packageDocumentation
 * @module utilities
 */
import {IPaginationDetails} from './pagination-details.interface';

/**
 * Interface for representations of paginated outputs.
 */
export interface IPaginationInstance<T> {

  /**
   * Information on the pagination.
   */
  details?: IPaginationDetails;

  /**
   * The current page of this instance.
   */
  count: number;

  /**
   * An array of the data records contained in this instance.
   */
  rows: T[];

}
