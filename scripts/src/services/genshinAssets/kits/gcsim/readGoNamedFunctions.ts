import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { readNamedFunction } from "#src/services/genshinAssets/kits/gcsim/readNamedFunction";

// Each named function and method of a file, read once for the positions in it
export const readGoNamedFunctions = (tokens: readonly GoToken[]): GoNamedFunction[] =>
  tokens.flatMap((token, position) => {
    if (token.text !== "func") return [];
    const namedFunction = readNamedFunction(tokens, position);
    return namedFunction === undefined ? [] : [namedFunction];
  });
