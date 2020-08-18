/**
 * @packageDocumentation
 * @module endpoint
 */
import {TranslationController} from './translations';
import {LanguageController} from './language';

/**
 * All of the back-end controllers.
 */
export const controllers: Function[] = [
  LanguageController,
  TranslationController
];

// TODO Add auth end point.

// TODO Fix more headers

// TODO Remove all // ------

// TODO Get tests working.
