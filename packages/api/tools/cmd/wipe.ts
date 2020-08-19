/**
 * @packageDocumentation
 * @module tools
 */
// tslint:disable: no-trailing-whitespace
import {wipeUtility} from '../wipe';

// Populate the database with initial data.
wipeUtility
  .wipe()
  .then(
    () => {
      console.log('Wiping database complete');

      process.exit();
    }
  )
  .catch(
    (err: any) => {
      console.log(`
      
      
ERROR      
      `, err, `
      
      
      
      
      `, err[0], `
      
ERROR      
      
      `);

      throw new Error(err);
    }
  );
  // tslint:enable: no-trailing-whitespace
