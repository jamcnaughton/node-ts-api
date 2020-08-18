/**
 * @packageDocumentation
 * @module service
 */
import * as Bluebird from 'bluebird';
import {userService} from '../user';
import {translationService} from './translation.service';

/**
 * A class for helping get translations for a particular user.
 */
export class TranslationHelper {

  
  /**
   * The preferred language of the user this helper instance is affiliated with.
   */
  private preferredLanguageId: string;

  /**
   * An array of translations indexed by key.
   */
  private translations: string[] = [];

  
  /**
   * Prepares an instance of the translation helper.
   *
   * @param userId The ID of the user to get translations for.
   * @param tenant The tenant of the user.
   */
  public constructor (
    private userId: string,
    private tenant: string
  ) {}

  
  /**
   * Get the user's preferred language.
   *
   * @param A promise which returns the user's preferred language.
   */
  public init(): Bluebird<void> {
    return userService.getUserPreferredLanguage(
      this.userId,
      this.tenant
    )
    .then(
      (preferredLanguageId: string) => {
        this.preferredLanguageId = preferredLanguageId;
      }
    )
    .then(
      () => translationService.getAll(
        this.preferredLanguageId,
        this.tenant
      )
    )
    .then(
      (translations: string[]) => {
        this.translations = translations;
      }
    );

  }

  /**
   * Gets the preferred language ID for the helper's affiliated user.
   * .
   * @returns The ID of the user's preferred language..
   */
  public getPreferredLanguageId (): string {
    return this.preferredLanguageId;
  }

  /**
   * Gets the text for the key appropriate for the user.
   *
   * @param key The key to get related text for.
   * @returns The language-specific text.
   */
  public getText (key: string): string {
    return this.translations[key] ? this.translations[key] : key;
  }

}

