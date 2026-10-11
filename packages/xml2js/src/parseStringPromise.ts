import type { convertableToString, ParserOptions } from "xml2js";

import { Parser } from "#src/Parser";

// Resolves to null when the document has no root element, since there is no object to return for it
export const parseStringPromise = <T>(
  convertableToString: convertableToString,
  options?: ParserOptions,
): Promise<T | null> => {
  const parserInstance = new Parser(options);
  return parserInstance.parseStringPromise(convertableToString);
};
