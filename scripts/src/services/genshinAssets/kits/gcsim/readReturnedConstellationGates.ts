import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { ReturnedConstellationGate } from "#src/models/genshinAssets/kits/gcsim/ReturnedConstellationGate";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { ReturnedConstellationComparison } from "#src/models/genshinAssets/kits/gcsim/ReturnedConstellationComparison";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { findBlock } from "#src/services/genshinAssets/kits/gcsim/findBlock";
import { findClosing } from "#src/services/genshinAssets/kits/gcsim/findClosing";

// Whether the braces of a block hold a `return` at the block's own level, not one in a nested closure or branch
const checkIsReturning = (tokens: readonly GoToken[], open: number, close: number): boolean => {
  let depth = 0;
  for (let position = open + 1; position < close; position++)
    if (checkIsGoPunctuation(tokens[position], "{")) depth++;
    else if (checkIsGoPunctuation(tokens[position], "}")) depth--;
    else if (depth === 0 && tokens[position]?.text === "return") return true;
  return false;
};

// The blocks of a file opened by `if c.Base.Cons < N {` or `if c.Base.Cons >= N {` that end in a return, each with the
// Block its `if` sits in, which the code after the return runs in
export const readReturnedConstellationGates = (tokens: readonly GoToken[]): ReturnedConstellationGate[] => {
  const gates: ReturnedConstellationGate[] = [];
  for (const [ifPosition, token] of tokens.entries()) {
    // An `if` after `else` runs only where the branches before it do not, so its return does not end the code after its
    // Block at every constellation its test holds
    if (
      token.text !== "if" ||
      tokens[ifPosition - 1]?.text === "else" ||
      tokens[ifPosition + 1]?.text !== "c" ||
      !checkIsGoPunctuation(tokens[ifPosition + 2], ".") ||
      tokens[ifPosition + 3]?.text !== "Base" ||
      tokens[ifPosition + 5]?.text !== "Cons" ||
      tokens[ifPosition + 7]?.kind !== GoTokenKind.Number
    )
      continue;
    const comparison = checkIsGoPunctuation(tokens[ifPosition + 6], "<")
      ? ReturnedConstellationComparison.Less
      : checkIsGoPunctuation(tokens[ifPosition + 6], ">=")
        ? ReturnedConstellationComparison.GreaterOrEqual
        : undefined;
    const open = ifPosition + 8;
    const end = checkIsGoPunctuation(tokens[open], "{") ? findClosing(tokens, open, "{", "}") : undefined;
    if (comparison === undefined || end === undefined || !checkIsReturning(tokens, open, end)) continue;
    const scope = findBlock(tokens, ifPosition);
    gates.push({
      comparison,
      end,
      ifPosition,
      scopeEnd: scope.end,
      scopeStart: scope.start,
      threshold: Number(tokens[ifPosition + 7]?.text),
    });
  }
  return gates;
};
