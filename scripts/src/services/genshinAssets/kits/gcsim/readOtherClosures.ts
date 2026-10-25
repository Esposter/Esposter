import type { GoBlock } from "#src/models/genshinAssets/kits/gcsim/GoBlock";
import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";

// The braces of each closure in a function's body that a position is not in, `func(...) {` ... `}`: a closure's locals
// And assignments are its own, so a reference outside it never reads them
export const readOtherClosures = (tokens: readonly GoToken[], scope: GoNamedFunction, position: number): GoBlock[] => {
  const blocks: GoBlock[] = [];
  for (let funcPosition = scope.bodyStart + 1; funcPosition < scope.bodyEnd; funcPosition++) {
    if (
      tokens[funcPosition]?.kind !== GoTokenKind.Identifier ||
      tokens[funcPosition]?.text !== "func" ||
      !checkIsGoPunctuation(tokens[funcPosition + 1], "(")
    )
      continue;
    let start = (findClosing(tokens, funcPosition + 1, "(", ")") ?? tokens.length) + 1;
    while (start < tokens.length && !checkIsGoPunctuation(tokens[start], "{")) start++;
    const end = findClosing(tokens, start, "{", "}") ?? tokens.length;
    if (!(start < position && position < end)) blocks.push({ end, start });
  }
  return blocks;
};
