import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

// The names a parameter list declares, `(a, b int, c string)` giving `a`, `b` and `c`: a name with no type of its own takes
// The type of the group after it
export const readParameterNames = (
  tokens: readonly GoToken[],
  openingPosition: number,
  closingPosition: number,
): string[] => {
  const groups: GoToken[][] = [[]];
  let depth = 0;
  for (const token of tokens.slice(openingPosition + 1, closingPosition)) {
    if (checkIsGoPunctuation(token, "(") || checkIsGoPunctuation(token, "[") || checkIsGoPunctuation(token, "{"))
      depth++;
    else if (checkIsGoPunctuation(token, ")") || checkIsGoPunctuation(token, "]") || checkIsGoPunctuation(token, "}"))
      depth--;
    if (depth === 0 && checkIsGoPunctuation(token, ",")) groups.push([]);
    else groups.at(-1)?.push(token);
  }
  const names: string[] = [];
  let untyped: string[] = [];
  for (const [first, ...rest] of groups) {
    if (first?.kind !== GoTokenKind.Identifier) continue;
    if (rest.length === 0) untyped.push(first.text);
    else {
      names.push(...untyped, first.text);
      untyped = [];
    }
  }
  return names;
};
