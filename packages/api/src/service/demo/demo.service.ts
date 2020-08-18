
/**
 * @packageDocumentation
 * @module service
 */
import * as Bluebird from 'bluebird';
import {Transaction} from 'sequelize';
import {sequelize} from '../../model';
import {DemoBackup} from '../../model/demo-backup/demo-backup.model';
import {User} from '../../model/user';

/**
 * Service class for handling the demo tenant.
 */
export class DemoService {

  // ----- Public Static Global Variables ----- //

  /**
   * The name of the demo tenant in the database.
   */
  public static demoTenantName = 'demo';

  // ----- Private Static Global Variables ----- //

  /**
   * The names of the tables to keep storage keys from.
   */
  public static contentTables = ['DocumentContent', 'ImageContent', 'VideoContent'];

  // ------ Public Methods ------- //

  /**
   * Resets the demo tenant.
   *
   * @returns A promise which attempts to reset the demo tenant.
   */
  public reset (): Bluebird<boolean> {

    // Start a transaction.
    return sequelize.transaction(
      (transaction: Transaction) => {

        // Get the demo backup records.
        return DemoBackup.findAll(
          {
            order: [
              [
                'position',
                'DESC'
              ]
            ],
            transaction
          }
        )

        // Process the backup records.
        .then(
          (demoBackups: DemoBackup[]) => {

            // Create a reversed list of the demo backups.
            const reversedDemoBackup: DemoBackup[] = [];
            for (let i = demoBackups.length - 1; i >= 0; i--) {
              reversedDemoBackup.push(demoBackups[i]);
            }

            // Create array of storage keys to check contents with.
            const storageKeys: string[] = [];

            // Loop through the back ups to get storage keys.
            for (const demoBackup of demoBackups) {

              // Check if this is a content table.
              if (DemoService.contentTables.indexOf(demoBackup.tableName) > -1) {

                // Get the contents to check.
                const contents: {}[] = JSON.parse(demoBackup.contents);

                // Store storage keys if needed.
                for (const contentItem of contents) {
                  if (contentItem['storageKey']) {
                    storageKeys.push(contentItem['storageKey']);
                  }
                }

              }

            }

            // Wipe tables in order.
            return Bluebird.each(
              demoBackups,
              (demoBackup) => {

                // Get the model for this table.
                const model = sequelize.model(demoBackup.tableName);

                // Delete the contents of this table.
                return model.destroy(
                  {
                    hooks: false,
                    where: {},
                    searchPath: `"${DemoService.demoTenantName}"`,
                    transaction
                  }
                );

              }
            )

            // Repopulate tables in order.
            .then(
              () => Bluebird.each(
                reversedDemoBackup,
                (demoBackup) => {

                  // Get the model for this table.
                  const model = sequelize.model(demoBackup.tableName);

                  // Get the contents to store.
                  const contents: {}[] = JSON.parse(demoBackup.contents);

                  // Special case for users to avoid re-hashing passwords.
                  if (demoBackup.tableName === 'User') {

                    // Update start and expiry dates.
                    for (const content of contents) {
                      content['startDate'] = new Date();
                      content['passwordExpires'] = new Date().setMonth(new Date().getMonth() + 6);
                    }

                    // Update the user with hashing their password.
                    return User.bulkCreate(
                      contents,
                      {
                        hooks: false,
                        validate: false,
                        searchPath: `"${DemoService.demoTenantName}"`,
                        transaction
                      }
                    );
                  }

                  // Repopulate the contents of this table.
                  return model.bulkCreate(
                    contents,
                    {
                      searchPath: `"${DemoService.demoTenantName}"`,
                      transaction
                    }
                  );

                }
              )
            )

            // Pass on the storage keys.
            .then(
              () => storageKeys
            );

          }
        );

      }
    )

    // When done pass true.
    .then(
      () => true
    );

  }

}

/**
 * A service which handles the demo tenant.
 */
export const demoService: DemoService = new DemoService();
