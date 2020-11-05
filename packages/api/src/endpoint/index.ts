/**
 * @packageDocumentation
 * @module endpoint
 */
import {AuthController} from './auth';
import {LanguageController} from './language';
import {TranslationController} from './translations';

/**
 * All of the back-end controllers.
 */
export const controllers: Function[] = [
  AuthController,
  LanguageController,
  TranslationController
];
