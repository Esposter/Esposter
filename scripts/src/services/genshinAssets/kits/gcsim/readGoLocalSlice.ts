import type { GoLocalSlice } from "#src/models/genshinAssets/kits/gcsim/GoLocalSlice";
import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readGoEnclosingBodyStart } from "#src/services/genshinAssets/kits/gcsim/readGoEnclosingBodyStart";

// The local slice a name is declared as before a position in the same function, the nearest declaration above it, else
// Undefined. A declaration of a slice that is not a composite literal gives none
export const readGoLocalSlice = (
  tokens: readonly GoToken[],
  namedFunctions: readonly GoNamedFunction[],
  name: string,
  position: number,
): GoLocalSlice | undefined => {
  // The search stops at the named function's body the position is in, so an earlier function's local is not read.
  // A closure runs in its enclosing function, so the search passes over the closure's `func` to the locals above it
  const functionStart = readGoEnclosingBodyStart(namedFunctions, position);
  // A block that closed before the position ends the scope of its declarations, so the walk back counts braces:
  // Each `}` passed raises the depth and each `{` lowers it, and only a declaration at depth zero is read
  let depth = 0;
  for (let declaration = position - 1; declaration > functionStart; declaration--) {
    const token = tokens[declaration];
    if (checkIsGoPunctuation(token, "}")) depth++;
    else if (checkIsGoPunctuation(token, "{") && depth > 0) depth--;
    // A plain assignment after the declaration, `ele = ...` in a branch, may leave the declared value unset, so the
    // Local reads as unknown rather than as its declaration
    if (
      token?.kind === GoTokenKind.Identifier &&
      token.text === name &&
      checkIsGoPunctuation(tokens[declaration + 1], "=") &&
      !checkIsGoPunctuation(tokens[declaration - 1], ".")
    )
      return undefined;
    if (
      depth > 0 ||
      token?.kind !== GoTokenKind.Identifier ||
      token.text !== name ||
      !checkIsGoPunctuation(tokens[declaration + 1], ":=") ||
      !checkIsGoPunctuation(tokens[declaration + 2], "[") ||
      !checkIsGoPunctuation(tokens[declaration + 3], "]")
    )
      continue;
    // The element type between the brackets and the brace, `attributes.Element`, is skipped
    let brace = declaration + 4;
    while (tokens[brace]?.kind === GoTokenKind.Identifier || checkIsGoPunctuation(tokens[brace], ".")) brace++;
    if (!checkIsGoPunctuation(tokens[brace], "{")) return undefined;
    const { expression } = parseGoExpression(tokens, brace);
    return expression.kind === GoExpressionKind.Composite
      ? { elements: expression.elements, line: token.line }
      : undefined;
  }
  return undefined;
};
