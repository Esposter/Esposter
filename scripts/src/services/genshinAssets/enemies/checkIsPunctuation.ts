import type { LuaToken } from "#src/models/genshinAssets/enemies/LuaToken";

import { LuaTokenKind } from "#src/models/genshinAssets/enemies/LuaTokenKind";

// Whether a token is the punctuation the literal's syntax names at that point, so a string that spells it is not
export const checkIsPunctuation = (token: LuaToken | undefined, text: string): boolean =>
  token?.kind === LuaTokenKind.Punctuation && token.text === text;
