import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

// The positions a method of a file is called at, `c.danceDoubleTicker(` and its kin, each at the method's name
export const readGoMethodCallSites = (tokens: readonly GoToken[], name: string): number[] =>
  tokens.flatMap((token, position) =>
    token.kind === GoTokenKind.Identifier &&
    token.text === name &&
    checkIsGoPunctuation(tokens[position - 1], ".") &&
    checkIsGoPunctuation(tokens[position + 1], "(")
      ? [position]
      : [],
  );
