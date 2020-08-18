/**
 * @packageDocumentation
 * @module tools
 */
// tslint:disable no-console
import * as Bluebird from 'bluebird';
import { exec } from 'child_process';
import * as fs from 'fs';
import {TenantInfo} from 'packages/api/src/model/tenant-info';
import {
  sequelize
} from '../../src/model';
import {Template} from '../../src/model/template';
import { wipeUtility } from '../wipe';

/**
 * Class which handles squashing the database migrations.
 */
export class SquashUtility {

  /**
   * Squash the migrations
   *
   * @returns A promise which squashes the migrations.
   */
  public squash (): Bluebird<void> {

    // Establish array for holding tenant info..
    let tenantInfoRecords: TenantInfo[] = [];

    // Wipe and do a full migration.
    return this.wipeAndMigrate()

    // Get tenant info.
    .then(
      () => TenantInfo.findAll({logging: false})
      .then(
        (newTenantInfoRecords: TenantInfo[]) => tenantInfoRecords = newTenantInfoRecords
      )
    )

    // Get all the schemas.
    .then(
      () => sequelize.showAllSchemas({logging: false})
    )

    // Process returned schemas
    .then(
      (schemas: string[]) => {

        // Update on progress.
        console.log('Starting migration squash...');

        // Establish path for backend/packages/db/src/.
        const path = `${__dirname}/../../../db/src`;

        // Delete contents of tenant info list.
        fs.unlinkSync(`${path}/seeds/seed-list.json`);

        // Delete contents of definitions seed.
        const defPath = `${path}/seeds/models/defs`;
        const defFiles = fs.readdirSync(defPath);
        for (const defFile of defFiles) {
          fs.unlinkSync(`${defPath}/${defFile}`);
        }

        // Delete the list definition file.
        fs.unlinkSync(`${path}/seeds/models/list.json`);

        // Delete contents of tenant seed.
        const tenantsPath = `${path}/seeds/tenants`;
        for (const schema of schemas) {
          const tenantsSchemaPath = `${tenantsPath}/${schema}`;
          const tenantSchemaFiles = fs.readdirSync(tenantsSchemaPath);
          for (const tenantSchemaFile of tenantSchemaFiles) {
            fs.unlinkSync(`${tenantsSchemaPath}/${tenantSchemaFile}`);
          }
        }

        // Write new seed list contents.
        const tenantInfoObj = [];
        for (const tenantInfo of tenantInfoRecords) {
          tenantInfoObj.push(
            {
              id: tenantInfo.id,
              schemaName: tenantInfo.schemaName
            }
          );
        }
        fs.writeFileSync(
          `${path}/seeds/seed-list.json`,
          JSON.stringify(
            tenantInfoObj,
            null,
            2
          )
        );

        // Pull data from the public Template table in order.
        return Template.findAll(
          {
            order: [['position', 'ASC']],
            logging: false
          }
        )

        // Process template records.
        .then(
          (templateRecords: Template[]) => {

            // Establish list object.
            const listObj: {}[] = [];

            // Establish array of promises for getting table contents.
            const getTableContents: Bluebird<void>[] = [];

            // Loop through records in the Template table.
            for (const templateRecord of templateRecords) {

              // Get table name in snake case.
              const modelName = this.PascalCaseToSnakeCase(templateRecord.tableName);

              // Add entry to list object.
              listObj.push(
                {
                  tableName: templateRecord.tableName,
                  modelName: modelName,
                  timestamps: templateRecord.timestamps
                }
              );

              // Store beautified table definition in model definitions.
              fs.writeFileSync(
                `${path}/seeds/models/defs/${modelName}.json`,
                JSON.stringify(
                  JSON.parse(templateRecord.definition),
                  null,
                  2
                )
              );

              // Get the model for this table.
              const model = sequelize.model(templateRecord.tableName);

              // Loop through schemas.
              for (const schema of schemas) {

                // Pull data from schema's corresponding table into an object.
                getTableContents.push(
                  model.findAll(
                    {
                      searchPath: `"${schema}"`,
                      logging: false
                    }
                  )
                  .then(
                    (objs: any[]) => {

                      // Store beautified object in the schema's seed.
                      fs.writeFileSync(
                        `${path}/seeds/tenants/${schema}/${modelName}.json`,
                        JSON.stringify(
                          objs,
                          null,
                          2
                        )
                      );

                    }
                  )
                );

              }

            }

            // Execute promise to get all table contents.
            return Bluebird.all(getTableContents)

            // Continue after getting table contents.
            .then (
              () => {

                // Store beautified list object as file.
                fs.writeFileSync(
                  `${path}/seeds/models/list.json`,
                  JSON.stringify(
                    listObj,
                    null,
                    2
                  )
                );

                // Delete all but the first migration.
                const migrationPath = `${path}/migrations`;
                const migrationFiles = fs.readdirSync(migrationPath);
                for (const migrationFile of migrationFiles) {
                  if (migrationFile !== '20200101000000-initial-seed.js') {
                    fs.unlinkSync(`${migrationPath}/${migrationFile}`);
                  }
                }

                // Update on progress.
                console.log('Migration squash complete.');

                // Wipe and do a full migration.
                return this.wipeAndMigrate();

              }
            );

          }
        );

      }
    );

  }

  /**
   * Convert a key from pascal case into snake case.
   *
   * @param key The key to convert.
   * @return The key in snake case.
   */
  public PascalCaseToSnakeCase (key: string) {
    return key.replace( /([A-Z])/g, '-$1').toLowerCase().substr(1);
  }

  /**
   * Wipe the database then perform all the migrations.
   */
  private wipeAndMigrate (): Bluebird<void> {

    // Update on progress.
    console.log('Wiping database and running all migrations (this may take a while)...');

    // Wipe the database.
    return wipeUtility.wipe(false)

    // Run seed migrations (use sequelize-migrate).
    .then(
      () => new Bluebird(
        (resolve, reject) => {
          exec(
            'npm run db:migrate',
            {env: process.env},
            (err) => {
              if (err) {
                reject(err);
              } else {
                console.log('Database up to date.');
                resolve();
              }
            }
          );
        }
      )
    );

  }

}

/**
 * A utility object which handles squashing migrations.
 */
export const squashUtility: SquashUtility = new SquashUtility();
