/**
 * @packageDocumentation
 * @module service
 */
import {Format, TransformableInfo} from 'logform';
import {createLogger, format, Logger, transports} from 'winston';

/**
 * Service class for handling logging.
 */
export class LogService {

  /**
   * The logger object for recording with.
   */
  public logger: Logger;

  /**
   * The formatter of the logs.
   */
  private formatter: Format = format.printf((info: TransformableInfo) => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
  });

  /**
   * Creates an instance of log service.
   */
  constructor () {

    // Set logging level for environment.
    let loggingLevel = 'debug';
    if (process.env.NODE_ENV === 'production') {
      loggingLevel = 'info';
    }

    // Establish the output for the logs.
    const ts: any[] = [
      new transports.Console({level: loggingLevel})
    ];

    // Establish the logger.
    this.logger = createLogger(
      {
        format: format.combine(
          format.label({label: 'city-api'}),
          format.timestamp(),
          format.prettyPrint(),
          format.colorize(),
          this.formatter
        ),
        transports: ts
      }
    );

  }
}

/**
 * A service which handles logging.
 */
export const logService: LogService = new LogService();
