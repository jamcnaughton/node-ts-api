/**
 * @packageDocumentation
 * @module bin
 */
import * as http from 'http';
import {logService} from '../service/log';
import {app} from './app';

/**
 * The port number of the back-end service.
 */
const port: number = +process.env.PORT || 8080;

// Start http server using the app (as it is implemented as an express-service).
http
.createServer(app)
.listen(
  port,
  () => logService.logger.log('info', `Application running on port ${port}`)
);
