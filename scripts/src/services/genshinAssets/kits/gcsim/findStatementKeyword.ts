import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

// The keyword a brace's statement opens with, such as `if` or `switch`, scanning back over its tokens to the line or block
// It starts in, else undefined. A function literal's or a struct's brace has no such keyword in its statement, and a switch
// With an init statement, `switch x := f(); x {`, is not read since the scan stops at its `;`. A `func` met on the way
// Belongs to a function literal in that statement, `if x := func() int { ... }(); x > 0 {`, so the brace is the literal's
export const findStatementKeyword = (
  tokens: readonly GoToken[],
  openPosition: number,
  keyword: string,
): number | undefined => {
  for (let position = openPosition - 1; position >= 0; position--) {
    const token = tokens[position];
    if (
      token === undefined ||
      token.kind === GoTokenKind.Newline ||
      token.text === "func" ||
      checkIsGoPunctuation(token, "{") ||
      checkIsGoPunctuation(token, "}") ||
      checkIsGoPunctuation(token, ";")
    )
      return undefined;
    if (token.text === keyword) return position;
  }
  return undefined;
};
