import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

// The position of the innermost block opened before the position and not yet closed, the `{` of the scope it sits in
export const findEnclosingOpen = (tokens: readonly GoToken[], position: number): number | undefined => {
  let depth = 0;
  for (let cursor = position - 1; cursor >= 0; cursor--)
    if (checkIsGoPunctuation(tokens[cursor], "}")) depth++;
    else if (checkIsGoPunctuation(tokens[cursor], "{")) {
      if (depth === 0) return cursor;
      depth--;
    }
  return undefined;
};
