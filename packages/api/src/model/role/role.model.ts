/**
 * @packageDocumentation
 * @module model
 */
// tslint:disable member-access
import {
  AllowNull, BelongsToMany,
  Column,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  Unique
} from 'sequelize-typescript';
import {User} from '../user';
import {UserHasRole} from '../user-has-role';

/**
 * A sequelizer supporting model which represents a role.
 */
@Table
export class Role extends Model<Role> {


  /**
   * The unique ID of the role.
   */
  @IsUUID(4)
  @PrimaryKey
  @AllowNull(false)
  @Unique
  @Default(Sequelize.UUIDV4)
  @Column(Sequelize.UUID)
  id: string;

  /**
   * The name of the role.
   */
  @Column
  name: string;

  /**
   * An array of the users affiliated with this role.
   */
  @BelongsToMany(() => User, () => UserHasRole)
  users: User[];

}
