/**
 * @module service
 */
import * as Bluebird from 'bluebird';
import {Operators} from 'sequelize';
import {sequelize} from '../../model';
import {Language} from '../../model/language';
import {Translation} from '../../model/translation';
import {languageService} from '../language';

/**
 * A class for handling translations.
 */
export class TranslationService {

  // ------ Public Methods ------- //

  /**
   * Returns all front-end translations for the sign-in pages for the supplied tenant.
   *
   * @param tenant The tenant the translations must belong to.
   * @returns A promise which attempts to get the relevant translations in a flattened object.
   */
  public readFrontEndSignInTranslations (tenant: string): Bluebird<{}> {

    // Get relevant language IDs for the tenant.
    return languageService.read(tenant)
    .then(
      (languages: Language[]) => {

        // Get array of language IDs.
        const languageIds: string[] = languages.map(
          (value: Language) => value.id
        );

        // Returns a promise which attempts to get the relevant translations.
        return Translation.findAll(
          {
            searchPath: `"${tenant}"`,
            where: {
              frontendSignIn: true,
              languageId: languageIds
            }
          }
        )

        // Flatten translations into a single object.
        .then(
          (translations: Translation[]) => {
            const translationsObject = {};
            for (const languageId of languageIds) {
              const translationsForLangObject = {};
              for (const translation of translations) {
                const translationKey = translation.translationKey.replace('frontend-sign-in.', '');
                translationsForLangObject[translationKey] = translation.data;
              }
              translationsObject[languageId] = translationsForLangObject;
            }
            return translationsObject;
          }
        );

      }
    );


  }

  /**
   * Returns all front-end translations for the sign-in pages for the supplied tenant.
   *
   * @param tenant The tenant the translations must belong to.
   * @returns A promise which attempts to get the relevant translations in a flattened object.
   */
  public readFrontEndReferenceTranslations (tenant: string): Bluebird<{}> {
    const op: Operators = sequelize.Op;

    // Get relevant language IDs for the tenant.
    return languageService.read(tenant)
    .then(
      (languages: Language[]) => {

        // Get array of language IDs.
        const languageIds: string[] = languages.map(
          (value: Language) => value.id
        );

        // Returns a promise which attempts to get the relevant translations.
        return Translation.findAll(
          {
            searchPath: `"${tenant}"`,
            where: {
              [op.and]: [
                {
                  [op.or]: [
                    {
                      translationKey: {
                        [op.like]: `frontend-sign-in.title%`
                      }
                    },
                    {
                      translationKey: {
                        [op.iLike]: `frontend-tenant.references%`
                      }
                    }
                  ]
                },
                {
                  languageId: languageIds
                }
              ]
            }
          }
        )

          // Flatten translations into a single object.
          .then(
            (translations: Translation[]) => {
              const translationsObject = {};
              for (const languageId of languageIds) {
                const translationsForLangObject = {};
                for (const translation of translations) {
                  const translationKey = translation.translationKey
                    .replace('frontend-tenant.', '')
                    .replace('frontend-sign-in.', '');
                  translationsForLangObject[translationKey] = translation.data;
                }
                translationsObject[languageId] = translationsForLangObject;
              }
              return translationsObject;
            }
          );

      }
    );

  }

  /**
   * Returns all front-end translations for the non-sign-in pages for the supplied tenant.
   *
   * @param languageId The ID of the language the translations must belong to.
   * @param tenant The tenant the translations must belong to.
   * @returns A promise which attempts to get the relevant translations in a flattened object.
   */
  public readFrontEndTenantTranslations (languageId: string, tenant: string): Bluebird<{}> {

    // Returns a promise which attempts to get the relevant translations.
    return Translation.findAll(
      {
        searchPath: `"${tenant}"`,
        where: {
          frontendTenant: true,
          languageId: languageId
        }
      }
    )

    // Flatten translations into a single object.
    .then(
      (translations: Translation[]) => {
        const translationsObject = {};
        const translationsForLangObject = {};
        for (const translation of translations) {
          const translationKey = translation.translationKey.replace('frontend-tenant.', '');
          translationsForLangObject[translationKey] = translation.data;
        }
        translationsObject[languageId] = translationsForLangObject;
        return translationsObject;
      }
    );

  }

  /**
   * Get all the translations a specific language and tenant.
   *
   * @param languageId The ID of the language to get the translations in.
   * @param tenant The tenant to get the translations for.
   * @returns The language-specific translation strings.
   */
  public getAll (languageId: string, tenant: string): Bluebird<string[]> {
    return Translation.findAll(
      {
        where: {
          languageId: languageId
        },
        searchPath: `"${tenant}"`,
      }
    )
    .then(
      (translations: Translation[]) => {
        const toReturn: string[] = [];
        for (const translation of translations) {
          toReturn[translation.translationKey] = translation.data;
        }
        return toReturn;
      }
    );
  }

  /**
   * Get the translation for a key with a specific language and tenant.
   *
   * @param key The translation key to get data for.
   * @param languageId The ID of the language to get the translations in.
   * @param tenant The tenant to get the translations for.
   * @returns The language-specific translation string.
   */
  public getOne (key: string, languageId: string, tenant: string): Bluebird<string> {
    return  Translation.findOne(
      {
        where: {
          translationKey: key,
          languageId: languageId
        },
        searchPath: `"${tenant}"`,
      }
    )
    .then(
      (translation: Translation) => translation ? translation.data : key
    );
  }

}

/**
 * A service which handles getting the appropriate translations.
 */
export const translationService: TranslationService = new TranslationService();

