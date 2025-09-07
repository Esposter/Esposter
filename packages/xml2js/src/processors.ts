const prefixMatch = new RegExp(/(?!xmlns)^.*:/);

export const normalize = (string: string): string => string.toLowerCase();

export const firstCharLowerCase = (string: string): string => `${string.charAt(0).toLowerCase()}${string.slice(1)}`;

export const stripPrefix = (string: string): string => string.replace(prefixMatch, "");

export const parseNumbers = (string: string): number | string =>
  isNaN(Number(string)) ? string : Number(string) % 1 === 0 ? parseInt(string, 10) : parseFloat(string);

export const parseBooleans = (string: string): boolean | string =>
  /^(?:true|false)$/i.test(string) ? string.toLowerCase() === "true" : string;
