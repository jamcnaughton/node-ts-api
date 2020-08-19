/**
 * @packageDocumentation
 * @module utilities
 */

/**
 * An interface representing objects containing service error information.
 */
export interface IServiceError {

  /**
   * Short hand string to ID the error.
   */
  errorString: string;

  /**
   * The error message.
   */
  message: string;

  /**
   * The rest code of the error.
   */
  restCode: number;

  /**
   * An optional array of details.
   */
  details?: string[];

}

/**
 * A function to build a service error object.
 */
export function buildServiceError (
  errorString: string = null,
  message: string = null,
  restCode: number = null,
  details: string[] = []
): IServiceError {
  return <IServiceError>{
    errorString: errorString,
    message: message,
    restCode: restCode,
    details: details
  };
}
