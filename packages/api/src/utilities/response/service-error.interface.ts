/**
 * @packageDocumentation
 * @module utilities
 */

/**
 * An interface representing objects containing service error information.
 */
export interface IServiceError {

  /**
   * An optional array of details.
   */
  details?: string[];

  /**
   * The error message.
   */
  message: string;

  /**
   * The rest code of the error.
   */
  restCode: number;

}

/**
 * A function to build a service error object.
 */
export function buildServiceError (
  errorString: string = null,
  message: string = null,
  restCode: number = null
): IServiceError {
  return <IServiceError>{
    errorString: errorString,
    message: message,
    restCode: restCode
  };
}
