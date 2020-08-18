/**
 * @packageDocumentation
 * @module service
 */
import {
  compare,
  genSalt,
  hash
} from 'bcrypt';

/**
 * A service class which handles encryption related actions.
 */
export class EncryptionService {

  /**
   * Generates a password salt then passes it to a call back.
   *
   * @returns A promise which generates a salt then executes a call back function with it.
   */
  public encrypt (): Promise<string> {
    return genSalt()
      .then(
        (salt: string) => salt
      );
  }

  /**
   * Hashes a supplied password then passes it to a call back.
   *
   * @param input The supplied password.
   * @param salt The salt to hash the password with.
   * @returns A promise which generates a hashed password then executes a call back function with it.
   */
  public hash (input: string, salt: string): Promise<string> {
    return hash(input, salt);
  }

  /**
   * Checks that two supplied passwords match.
   *
   * @param firstPassword The first password to compare.
   * @param secondPassword The second password to compare
   * @returns A promise which compares the two passwords and returns a flag indicating whether they match.
   */
  public compare (firstPassword: string, secondPassword: string): Promise<boolean> {
    return compare(firstPassword, secondPassword);
  }
}

/**
 * A service which handles encryption.
 */
export const encryptionService: EncryptionService = new EncryptionService();
