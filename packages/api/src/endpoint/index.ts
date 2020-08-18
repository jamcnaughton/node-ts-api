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

// TODO Add end point tests.
