import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";

// A local slice declared in a function, `ele := []attributes.Element{c.conversionElem, attributes.Anemo}`: its entries as
// Written, and the line its name is declared on
export interface GoLocalSlice {
  elements: GoExpression[];
  line: number;
}

// The local slice a name is declared as before a position in the same function, the nearest declaration above it, else
// Undefined. A declaration of a slice that is not a composite literal gives none
export const readGoLocalSlice = (
  tokens: readonly GoToken[],
  name: string,
  position: number,
): GoLocalSlice | undefined => {
  for (let declaration = position - 1; declaration >= 0; declaration--) {
    const token = tokens[declaration];
    // A declaration in an earlier function is not the one the position reads, so a `func` above it ends the search
    if (token?.text === "func") return undefined;
    if (
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
