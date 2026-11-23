import type { LuaToken } from "#src/models/genshinAssets/enemies/LuaToken";

import { LuaTokenKind } from "#src/models/genshinAssets/enemies/LuaTokenKind";
import { checkIsPunctuation } from "#src/services/genshinAssets/enemies/checkIsPunctuation";

// A field's name, whether it is written as a name or as a quoted name in brackets, consumed with its `=`, or none when
// The next value is positional
export const readFieldName = (
  tokens: readonly LuaToken[],
  index: number,
): { name: string; next: number } | undefined => {
  const [first, second, third, fourth] = tokens.slice(index, index + 4);
  if (first?.kind === LuaTokenKind.Name && checkIsPunctuation(second, "="))
    return { name: first.text, next: index + 2 };
  if (
    checkIsPunctuation(first, "[") &&
    second?.kind === LuaTokenKind.String &&
    checkIsPunctuation(third, "]") &&
    checkIsPunctuation(fourth, "=")
  )
    return { name: second.text, next: index + 4 };
  return undefined;
};
