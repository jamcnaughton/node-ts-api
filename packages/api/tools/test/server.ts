/**
 * @packageDocumentation
 * @module tools
 */
import {app} from '../../src/bin';

/**
 * A function which creates a server instance running the app.
 */
export const server: Function = () => {

  // Set a port to run the server on.
  const port: number = +process.env.PORT || 8080;

  // Start the app.
  return app.listen(
    port,
    () => console.log(`Test server started on port ${port}`)
  );

};