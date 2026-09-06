const BOOLEAN_REGEX = /^(?:true|false)$/iu;

export const parseBooleans = (string: string): boolean | string =>
  BOOLEAN_REGEX.test(string) ? string.toLowerCase() === "true" : string;
