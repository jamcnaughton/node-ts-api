/**
 * @packageDocumentation
 * @module endpoint
 */
import {TranslationController} from './translations';
import {LanguageController} from './language';
import {AuthController} from './auth';

/**
 * All of the back-end controllers.
 */
export const controllers: Function[] = [
  AuthController,
  LanguageController,
  TranslationController
];
