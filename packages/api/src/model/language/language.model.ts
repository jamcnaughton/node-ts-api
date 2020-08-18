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
 * A model which represents a database entry containing language details.
 */
@Table
export class Language extends Model<Language> {

  /**
   * A unique ID representing the language.
   */
  @IsUUID(4)
  @PrimaryKey
  @AllowNull(false)
  @Unique
  @Default(Sequelize.UUIDV4)
  @Column(Sequelize.UUID)
  id: string;

  /**
   * The display name of the language.
   */
  @AllowNull(false)
  @NotEmpty
  @Column
  name: string;

  /**
   * The shorthand code for the language.
   */
  @AllowNull(false)
  @NotEmpty
  @Column
  code: string;

}
