import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

// The position of the `AttackInfo` literal an argument begins with, `info.AttackInfo{` or `combat.AttackInfo{`, else
// Undefined
export const findInlineAttackPosition = (tokens: readonly GoToken[], start: number): number | undefined => {
  let position = start;
  while (checkIsGoPunctuation(tokens[position + 1], ".") && tokens[position + 2]?.kind === GoTokenKind.Identifier)
    position += 2;
  return tokens[position]?.text === "AttackInfo" && checkIsGoPunctuation(tokens[position + 1], "{")
    ? position
    : undefined;
};
