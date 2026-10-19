import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { readGoEnclosingBodyStart } from "#src/services/genshinAssets/kits/gcsim/readGoEnclosingBodyStart";

// The position a name's value is read from at a position, where the name is bound nearest before it: a `:=` declaration
// In a block the position is in, or any `=` rebinding of it, from the function the position is in. Undefined where none is
export const readVisibleBindingValue = (
  tokens: readonly GoToken[],
  namedFunctions: readonly GoNamedFunction[],
  name: string,
  position: number,
): number | undefined => {
  const functionStart = readGoEnclosingBodyStart(namedFunctions, position);
  // A block that closed before the position ends the scope of its declarations, so each `}` passed raises the depth and
  // Each `{` lowers it, and only a declaration at depth zero is in scope
  let depth = 0;
  for (let previous = position - 1; previous > functionStart; previous--) {
    const token = tokens[previous];
    if (checkIsGoPunctuation(token, "}")) depth++;
    else if (checkIsGoPunctuation(token, "{") && depth > 0) depth--;
    if (
      token?.kind !== GoTokenKind.Identifier ||
      token.text !== name ||
      checkIsGoPunctuation(tokens[previous - 1], ".")
    )
      continue;
    if (checkIsGoPunctuation(tokens[previous + 1], "=")) return previous + 2;
    if (checkIsGoPunctuation(tokens[previous + 1], ":=") && depth === 0) return previous + 2;
  }
  return undefined;
};
