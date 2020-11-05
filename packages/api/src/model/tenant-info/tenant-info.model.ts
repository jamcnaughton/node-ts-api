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
 * A model which represents a database entry containing tenant information.
 */
@Table({
  timestamps: true
})
export class TenantInfo extends Model<TenantInfo> {

  /**
   * The unique ID of the tenant.
   */
  @IsUUID(4)
  @PrimaryKey
  @AllowNull(false)
  @Unique
  @Default(Sequelize.UUIDV4)
  @Column(Sequelize.UUID)
  id: string;

  /**
   * The schema of the tenant.
   */
  @NotEmpty
  @Column
  schemaName: string;

}
