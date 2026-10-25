import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

// The `{` a `range` header's expression is followed by, the first at no parenthesis depth so a `func` filter's own body
// Is passed over, else undefined
export const readRangeBodyStart = (tokens: readonly GoToken[], start: number): number | undefined => {
  let depth = 0;
  for (let position = start; position < tokens.length; position++)
    if (checkIsGoPunctuation(tokens[position], "(")) depth++;
    else if (checkIsGoPunctuation(tokens[position], ")")) depth--;
    else if (depth === 0 && checkIsGoPunctuation(tokens[position], "{")) return position;
  return undefined;
};
