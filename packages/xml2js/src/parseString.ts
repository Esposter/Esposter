import type { convertableToString, ParserOptions } from "xml2js";

import type { ParserCallback } from "#src/models/ParserCallback";
import { Parser } from "#src/Parser";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The options are optional, so the callback may stand in their place, as the upstream signature has always allowed
export const parseString = <T>(
  convertableToString: convertableToString,
  optionsOrCallback: ParserCallback<T> | Partial<ParserOptions>,
  callback?: ParserCallback<T>,
): void => {
  if (typeof optionsOrCallback === "function") {
    new Parser().parseString(convertableToString, optionsOrCallback);
    return;
  }
  if (!callback)
    throw new InvalidOperationError(Operation.Read, parseString.name, "needs a callback after its options");
  new Parser(optionsOrCallback).parseString(convertableToString, callback);
};
