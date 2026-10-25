import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

// The string each name of a file is set to, `c6Abil = "Boundless Origin (C6)"`, as an `Abil` names an attack by
// A constant
export const readGoStringConstants = (tokens: readonly GoToken[]): Map<string, string> => {
  const stringMap = new Map<string, string>();
  for (const [position, token] of tokens.entries()) {
    const value = tokens[position + 2];
    if (
      token.kind === GoTokenKind.Identifier &&
      checkIsGoPunctuation(tokens[position + 1], "=") &&
      value?.kind === GoTokenKind.String
    )
      stringMap.set(token.text, value.text.slice(1, -1));
  }
  return stringMap;
};
