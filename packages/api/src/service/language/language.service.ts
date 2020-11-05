/**
 * @packageDocumentation
 * @module service
 */
import * as Bluebird from 'bluebird';
import {Language} from '../../model/language';

/**
 * Service class for handling language related actions.
 */
export class LanguageService {

  /**
   * Returns several language models.
   *
   * @param tenant The tenant the languages to return must belong to.
   * @returns A promise which returns several language models.
   */
  public read (tenant: string): Bluebird<Language[]> {

    // Return a promise which returns several language models.
    return Language.findAll(
      {
        attributes: [
          'id',
          'name',
          'code'
        ],
        order: [
          [
            'name',
            'ASC'
          ]
        ],
        searchPath: `"${tenant}"`,
      }
    );

  }

}

/**
 * A service which handles interaction with the data stores relating to language information.
 */
export const languageService: LanguageService = new LanguageService();
