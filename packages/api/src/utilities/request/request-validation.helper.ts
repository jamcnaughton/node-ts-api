/**
 * @packageDocumentation
 * @module utilities
 */
import {Request} from 'express';
import {
  appendToServiceError,
  buildServiceErrorDirect,
  IServiceError,
  IServiceErrorCode
} from '../service-error';

// Load in Chai.
const chai = require('chai');
chai.use(require('chai-uuid'));
const expect = chai.expect;

/**
 * Defines the type of param to validate on.
 */
export enum ParamType {

  /**
   * Validate a param in the request body.
   */
  Body = 0,

  /**
   * Validate a param in the request URL query.
   */
  Query = 1,

  /**
   * Validate a param in the request URL route.
   */
  Route = 2

}

/**
 * A class for handling checks on a request with correctly
 * structured errors if any issues are detected.
 */
export class RequestValidationHelper {

  /**
   * Details of errors encountered during tests to return eventually.
   */
  private validationError: IServiceError = null;

  /**
   * Create an instance of the helper.
   *
   * @param errorCodes The object holding relevant error codes.
   * @param errorMessage The error message to display.
   * @param req The request object to perform all subsequent checks on.
   */
  public constructor(
    private errorCodes: IServiceErrorCode,
    private errorMessage: string,
    private req: Request
  ) {}

  /**
   * Check if a supplied value is present, a string and not too many character long
   *
   * @param fieldKey The key of the value to check.
   * @param length The maximum length of the supplied value allowed.
   * @param errorCode The code of the error to show.
   * @param paramType Indicates whether to run this check on request body, URL query or URL route params.
   */
  public isNotTooLong (
    fieldKey: string,
    length: number,
    errorCode: string,
    paramType: ParamType = ParamType.Body
  ) {
    try {
      this.isNotAnEmptyString(fieldKey, errorCode, paramType);
      switch (paramType) {
        case ParamType.Body:
          expect(this.req.body[fieldKey].length).to.be.below(length + 1);
          break;
        case ParamType.Route:
          expect(this.req.params[fieldKey].length).to.be.below(length + 1);
          break;
        case ParamType.Query:
          expect(this.req.query[fieldKey].length).to.be.below(length + 1);
          break;
      }
    } catch (error) {
      this.updateError(error, errorCode);
    }
  }

  /**
   * Check if a supplied value is present and a GUID.
   *
   * @fieldKey fieldKey The key of the value to check.
   * @param errorCode The code of the error to show.
   * @param paramType Indicates whether to run this check on request body, URL query or URL route params.
   */
  public isGuid (
    fieldKey: string,
    errorCode: string,
    paramType: ParamType = ParamType.Body
  ) {
    try {
      this.isPresent(fieldKey, errorCode, paramType);
      switch (paramType) {
        case ParamType.Body:
          expect(this.req.body[fieldKey]).to.be.a.guid();
          break;
        case ParamType.Route:
          expect(this.req.params[fieldKey]).to.be.a.guid();
          break;
        case ParamType.Query:
          expect(this.req.query[fieldKey]).to.be.a.guid();
          break;
      }
    } catch (error) {
      this.updateError(error, errorCode);
    }
  }

  /**
   * Perform a check on the request to ensure a key exists within it,
   * is a string and is not empty.
   *
   * @fieldKey fieldKey The key of the value to check.
   * @param errorCode The code of the error code to show.
   * @param paramType Indicates whether to run this check on request body, URL query or URL route params.
   */
  public isNotAnEmptyString (
    fieldKey: string,
    errorCode: string,
    paramType: ParamType = ParamType.Body
  ) {
    try {
      this.isPresent(fieldKey, errorCode, paramType);
      switch (paramType) {
        case ParamType.Body:
          expect(this.req.body[fieldKey]).to.be.a('string').and.not.empty;
          break;
        case ParamType.Route:
          expect(this.req.params[fieldKey]).to.be.a('string').and.not.empty;
          break;
        case ParamType.Query:
          expect(this.req.query[fieldKey]).to.be.a('string').and.not.empty;
          break;
      }
    } catch (error) {
      this.updateError(error, errorCode);
    }
  }

    /**
   * Perform a check on the request to ensure a key exists within it,
   * is an array and is not empty.
   *
   * @fieldKey fieldKey The key of the value to check.
   * @param errorCode The code of the error code to show.
   * @param paramType Indicates whether to run this check on request body, URL query or URL route params.
   */
  public isNotAnEmptyArray (
    fieldKey: string,
    errorCode: string,
    paramType: ParamType = ParamType.Body
  ) {
    try {
      this.isPresent(fieldKey, errorCode, paramType);
      switch (paramType) {
        case ParamType.Body:
          expect(this.req.body[fieldKey]).to.be.a('Array').and.not.empty;
          break;
        case ParamType.Route:
          expect(this.req.params[fieldKey]).to.be.a('Array').and.not.empty;
          break;
        case ParamType.Query:
          expect(this.req.query[fieldKey]).to.be.a('Array').and.not.empty;
          break;
      }
    } catch (error) {
      this.updateError(error, errorCode);
    }
  }

  /**
   * Perform a check on the object to ensure a key exists within it.
   *
   * @param objectKey The key to check in the object.
   * @param errorCode The code of the error code to show.
   * @param paramType Indicates whether to run this check on request body, URL query or URL route params.
   */
  public isPresent (
    fieldKey: string,
    errorCode: string,
    paramType: ParamType = ParamType.Body
  ) {
    try {
      switch (paramType) {
        case ParamType.Body:
          expect(this.req.body[fieldKey]).to.exist;
          break;
        case ParamType.Route:
          expect(this.req.params[fieldKey]).to.exist;
          break;
        case ParamType.Query:
          expect(this.req.query[fieldKey]).to.exist;
          break;
      }
    } catch (error) {
      this.updateError(error, errorCode);
    }
  }

  /**
   * Check if there are any errors - if so throw an error response.
   *
   * @param code The REST status code to return if there are errors..
   * @param res The response to include the returned error information in.
   * @throws An error response if there are errors.
   */
  public validate () {
    if (this.validationError) {
      throw this.validationError;
    }
  }

  /**
   * Build or append to the helper's service error.
   *
   * @param error The error to detail.
   * @param errorCode The service error this relates to.
   */
  private updateError(error: Error, errorCode: string) {
    if (this.validationError) {
      appendToServiceError(
        this.validationError,
        errorCode,
        this.errorCodes[errorCode],
        error.message
      );
    } else {
      this.validationError = buildServiceErrorDirect(
        400,
        this.errorMessage,
        errorCode,
        this.errorCodes[errorCode],
        error.message
      );
    }
  }

}
