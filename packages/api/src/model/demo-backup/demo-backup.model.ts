/**
 * @packageDocumentation
 * @module model
 */
// tslint:disable member-access
import {
  AllowNull,
  Column,
  Default,
  IsUUID,
  Model,
  NotEmpty,
  PrimaryKey,
  Sequelize,
  Table,
  Unique
} from 'sequelize-typescript';

/**
 * A sequelizer supporting model which represents a backed up demo table.
 */
@Table
export class DemoBackup extends Model<DemoBackup> {

  // ------ Model Attributes ------- //

  /**
   * A unique ID representing the backed up demo table.
   */
  @IsUUID(4)
  @PrimaryKey
  @AllowNull(false)
  @Unique
  @Default(Sequelize.UUIDV4)
  @Column(Sequelize.UUID)
  id: string;

  /**
   * The name of the table.
   */
  @NotEmpty
  @Column
  tableName: string;

  /**
   * The position of the table in the list of tables to initialise.
   */
  @Column
  position: number;

  /**
   * The content of the table (stringified).
   */
  @NotEmpty
  @Column(Sequelize.TEXT)
  contents: string;

}
