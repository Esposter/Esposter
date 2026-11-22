import type { WikiParseResponse } from "#src/models/WikiParseResponse";

import { checkIsObject } from "#src/services/checkIsObject";
import { checkIsOptional } from "#src/services/checkIsOptional";

// The wikitext a page's text is read from, each level present or absent and the text a string
export const checkIsWikiParseResponse = (value: unknown): value is WikiParseResponse =>
  checkIsObject(value) &&
  checkIsOptional(
    value.parse,
    (parse) =>
      checkIsObject(parse) &&
      checkIsOptional(
        parse.wikitext,
        (wikitext) => checkIsObject(wikitext) && checkIsOptional(wikitext["*"], (text) => typeof text === "string"),
      ),
  );
