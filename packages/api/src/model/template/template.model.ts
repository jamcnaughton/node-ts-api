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
 * A sequelizer supporting model which represents a template.
 */
@Table
export class Template extends Model<Template> {

  // ------ Model Attributes ------- //

  /**
   * A unique ID representing the template.
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
   * Flag to indicate if timestamps are needed.
   */
  @Default(false)
  @Column
  timestamps: boolean;

  /**
   * The position of the table in the list of tables to initialise.
   */
  @Column
  position: number;

  /**
   * The definition of the table (stringified).
   */
  @NotEmpty
  @Column(Sequelize.TEXT)
  definition: string;

}
