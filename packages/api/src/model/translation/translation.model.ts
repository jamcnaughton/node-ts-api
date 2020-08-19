/**
 * @packageDocumentation
 * @module model
 */
// tslint:disable member-access
import {
  AllowNull,
  Column,
  Default,
  ForeignKey,
  IsUUID,
  Model,
  NotEmpty,
  PrimaryKey,
  Sequelize,
  Table,
  Unique
} from 'sequelize-typescript';
import {Language} from '../language';

/**
 * A model which represents a database entry containing translation details.
 */
@Table
export class Translation extends Model<Translation> {

  /**
   * A unique ID representing the hotspot.
   */
  @IsUUID(4)
  @PrimaryKey
  @AllowNull(false)
  @Unique
  @Default(Sequelize.UUIDV4)
  @Column(Sequelize.UUID)
  id: string;

  /**
   * the description of the action
   */
  @NotEmpty
  @Column(Sequelize.TEXT)
  data: string;

  /**
   * The Language ID of the content.
   */
  @AllowNull
  @ForeignKey(() => Language)
  @IsUUID(4)
  @Column(Sequelize.UUID)
  languageId: string;

  /**
   * The key used to find this translation.
   */
  @AllowNull
  @Column
  translationKey: string;

  /**
   * Flag to say whether the translation is used in the front end's sign-in pages.
   */
  @NotEmpty
  @Default(false)
  @Column
  frontendSignIn: boolean;

  /**
   * Flag to say whether the translation is used in the front end's non-sign-in pages.
   */
  @NotEmpty
  @Default(false)
  @Column
  frontendTenant: boolean;

}
