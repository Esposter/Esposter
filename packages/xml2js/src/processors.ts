const BOOLEAN_REGEX = /^(?:true|false)$/iu;
const PREFIX_MATCH_REGEX = /(?!xmlns)^.*:/u;

export const stripPrefix = (string: string): string => string.replace(PREFIX_MATCH_REGEX, "");

export const parseNumbers = (string: string): number | string => {
  const number = Number(string);
  return Number.isNaN(number) ? string : number;
};

export const parseBooleans = (string: string): boolean | string =>
  BOOLEAN_REGEX.test(string) ? string.toLowerCase() === "true" : string;
