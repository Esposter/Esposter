import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { readGoEnclosingFunction } from "#src/services/genshinAssets/kits/gcsim/readGoEnclosingFunction";

// The function a variable's value is returned by: the named function a position is in, when its body returns the variable,
// `return ai`, else undefined
export const readReturnedFunction = (
  tokens: readonly GoToken[],
  namedFunctions: readonly GoNamedFunction[],
  position: number,
  variableName: string | undefined,
): string | undefined => {
  const enclosing = readGoEnclosingFunction(namedFunctions, position);
  if (enclosing === undefined || variableName === undefined) return undefined;
  for (let cursor = enclosing.bodyStart + 1; cursor < enclosing.bodyEnd; cursor++)
    if (
      tokens[cursor]?.text === "return" &&
      tokens[cursor + 1]?.kind === GoTokenKind.Identifier &&
      tokens[cursor + 1]?.text === variableName
    )
      return enclosing.name;
  return undefined;
};
