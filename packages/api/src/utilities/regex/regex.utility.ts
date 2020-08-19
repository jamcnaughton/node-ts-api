/**
 * @packageDocumentation
 * @module utilities
 */

/**
 * Interface which houses multiple regex statements.
 */
interface IRegex {
  [key: string]: RegExp | string;
}

/**
 * A collection of useful regex statements.
 */
export const RegexUtility: IRegex = {
  camelCase: /([a-z])([A-Z])/g,
  emailSplit: /^(.)(.*)(.@.*)$/,
  eventUrl: /^[a-z0-9-_]+$/,
  floats: /^[-+]?[0-9]*\.?[0-9]+$/,
  hexColour: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  hhmmss: /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/,
  letters: /[^\w]/g,
  lowercaseSentence: /^[a-z]/,
  monetryValue: /^\d+(\.\d{1,2})?$/,
  name: /^[a-zA-Z\-\s\']+$/,
  numbers: /^[0-9]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[!£?~@#\$%\^&\*a-zA-Z\d]{8,30}$/,
  start: /^./,
  subdomainUrl: /^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i,
  url: /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i,
  url2: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i,
  uuidRoute: '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}'
};
