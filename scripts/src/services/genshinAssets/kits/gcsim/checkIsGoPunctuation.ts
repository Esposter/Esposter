import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";

export const checkIsGoPunctuation = (token: GoToken | undefined, text: string): boolean =>
  token?.kind === GoTokenKind.Punctuation && token.text === text;
