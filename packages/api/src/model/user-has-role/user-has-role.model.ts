/**
 * @packageDocumentation
 * @module model
 */
// tslint:disable member-access
import {
  Column,
  ForeignKey,
  IsUUID,
  Model,
  Sequelize,
  Table
} from 'sequelize-typescript';
import {Role} from '../role';
import {User} from '../user';

/**
 * A sequelizer supporting model which represents the relationship between roles and users
 */
@Table
export class UserHasRole extends Model<UserHasRole> {

  
  /**
   * The ID of a role.
   */
  @ForeignKey(() => Role)
  @IsUUID(4)
  @Column(Sequelize.UUID)
  roleId: string;

  /**
   * The ID of a user.
   */
  @ForeignKey(() => User)
  @IsUUID(4)
  @Column(Sequelize.UUID)
  userId: string;

}
