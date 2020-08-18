/**
 * @packageDocumentation
 * @module tools
 */
// tslint:disable: no-trailing-whitespace
import {squashUtility} from '../squash';

// Squash the migrations.
squashUtility
  .squash()
  .then(
    () => {
      console.log('Done');
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
