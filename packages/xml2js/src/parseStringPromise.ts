import type { convertableToString, ParserOptions } from "xml2js";

import { Parser } from "#src/Parser";

export const parseStringPromise = <T>(
  convertableToString: convertableToString,
  options?: ParserOptions,
): Promise<T> => {
  const parserInstance = new Parser(options);
  return parserInstance.parseStringPromise(convertableToString);
};
