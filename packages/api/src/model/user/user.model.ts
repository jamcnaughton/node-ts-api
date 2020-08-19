/**
 * @packageDocumentation
 * @module model
 */
// tslint:disable member-access
import {
  AfterValidate,
  AllowNull,
  BeforeBulkCreate,
  BeforeCreate,
  BelongsToMany,
  Column,
  Default,
  ForeignKey,
  Is,
  IsEmail,
  IsUUID,
  Model,
  NotEmpty,
  PrimaryKey,
  Sequelize,
  Table,
  Unique
} from 'sequelize-typescript';
import {encryptionService} from '../../service/encryption';
import {RegexUtility} from '../../utilities/regex';
import {buildServiceError} from '../../utilities/response';
import {Language} from '../language';
import {Role} from '../role';
import {UserHasRole} from '../user-has-role';

/**
 * A model which represents a database entry containing user details.
 */
@Table
export class User extends Model<User> {

  /**
   * A unique ID representing the user.
   */
  @IsUUID(4)
  @PrimaryKey
  @AllowNull(false)
  @Unique
  @Default(Sequelize.UUIDV4)
  @Column(Sequelize.UUID)
  id: string;

  /**
   * The user's password (hashed).
   */
  @Is('user', (value: string) => {
    if (!RegExp(RegexUtility.password).test(value)) {
      throw buildServiceError('invalid-password', 'Invalid password supplied', 422);
    }
  })
  @Column
  password: string;

  /**
   * The password's salt.
   */
  @Column
  passwordSalt: string;

  /**
   * The user's first name.
   */
  @Is('user', (value: string) => {
    if (!RegExp(RegexUtility.name).test(value)) {
      throw buildServiceError('invalid-first-name', 'Invalid first name supplied', 422);
    }
  })
  @Column
  firstName: string;

  /**
   * The user's surname.
   */
  @Is('user', (value: string) => {
    if (!RegExp(RegexUtility.name).test(value)) {
      throw buildServiceError('invalid-surname', 'Invalid surname supplied', 422);
    }
  })
  @Column
  surname: string;

  /**
   * The user's e-mail address.
   */
  @IsEmail
  @NotEmpty
  @Column({
    unique: { name: 'email', msg: 'ERR27'}
  })
  email: string;

  /**
   * Code of the user's preferred language.
   */
  @AllowNull
  @ForeignKey(() => Language)
  @IsUUID(4)
  @Column(Sequelize.UUID)
  preferredLanguageId: string;

  /**
   * Array of the roles available to the user.
   */
  @BelongsToMany(() => Role, () => UserHasRole)
  roles: Role[];

  /**
   * Performs a bulk action of hashing passwords in the database for a list of specified users.
   *
   * @param models An array of the users to hash passwords for.
   * @returns A promise which attempts to hash passwords for an array of users then return an array
   * of the hashed passwords.
   */
  @BeforeBulkCreate
  public static HASH_PASSWORD_BULK (models: User[]): Promise<string[]> {

    // Loop through users and create a promise for each which attempts to hash their password in the database.
    const promises: Promise<string>[] = models.map((model: User) => {
      this.EMAIL_LOWERCASE(model);

      return this.HASH_PASSWORD(model);
    });

    // Execute all the generated promises.
    return Promise.all(promises);
  }

  /**
   * Change email addresses to lower case.
   *
   * @param model The user to change the email for.
   */
  public static EMAIL_LOWERCASE (model: User): void {
    if (model.dataValues.email) {
      model.dataValues.email = model.dataValues.email.toLocaleLowerCase();
    }
  }

  /**
   * Hash the password of a single specific user in the database - used when a user account is created.
   *
   * @param model The user to hash the password for.
   * @returns A promise which attempts to hash the password of a specific user in the database.
   */
  @BeforeCreate
  @AfterValidate
  public static HASH_PASSWORD_SINGLE (model: User): Promise<string[]> {

    // Initialise a blank array of promises.
    const promises: Promise<string>[] = [];

    // Add a promise which attempts to hash the user's password in the database.
    promises.push(
      this.HASH_PASSWORD(model)
    );

    // Execute all the generated promises.
    return Promise.all(promises);
  }

  /**
   * Hashes password.
   *
   * @param model The user to hash the password for.
   * @returns The hashed password.
   */
  public static HASH_PASSWORD (model: User): Promise<string> {
    if (model.dataValues && model.dataValues.password) {
      return encryptionService.encrypt()
      .then(
        (salt: string) => {
          return encryptionService.hash(model.dataValues.password, salt)
          .then(
            (password: string) => {
              model.dataValues.passwordSalt = salt;
              return model.dataValues.password = password;
            }
          );
        }
      );
    }
  }

  /**
   * Checks that a user's supplied password matches that given in the database.
   *
   * @param password The password from the database.
   * @param userPassword The supplied user's password.
   * @returns A promise which compares the two passwords and returns a flag indicating whether they match.
   */
  public verifyPassword (password: string, userPassword: string): Promise<boolean> {
    return encryptionService.compare(password, userPassword);
  }
}
