import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { skipGoBrackets } from "#src/services/genshinAssets/kits/gcsim/skipGoBrackets";

// The name of the nearest function before the position, `a1AttackInfo` in `func (c *char) a1AttackInfo() info.AttackInfo {`
export const readFunctionName = (tokens: readonly GoToken[], position: number): string | undefined => {
  let start = position;
  while (start >= 0 && tokens[start]?.text !== "func") start--;
  if (start < 0) return undefined;
  const nameStart = checkIsGoPunctuation(tokens[start + 1], "(") ? skipGoBrackets(tokens, start + 1) : start + 1;
  // A declaration's name opens its parameters; a closure's `func() info.AttackInfo {` has its result type there instead
  return tokens[nameStart]?.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[nameStart + 1], "(")
    ? tokens[nameStart]?.text
    : undefined;
};
