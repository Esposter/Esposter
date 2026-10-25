import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { readFunctionName } from "#src/services/genshinAssets/kits/gcsim/readFunctionName";

// The name a literal at the position is given to, by `:=` or `=`, `ai := info.AttackInfo{` or `c.skillAttackInfo =
// Info.AttackInfo{`, read back past its qualified type. A literal a function returns takes that function's name, as a
// Helper's does, `return info.AttackInfo{` in `func (c *char) a1AttackInfo()`
export const readVariableName = (tokens: readonly GoToken[], position: number): string | undefined => {
  let start = position;
  while (checkIsGoPunctuation(tokens[start - 1], ".") && tokens[start - 2]?.kind === GoTokenKind.Identifier) start -= 2;
  if (tokens[start - 1]?.text === "return") return readFunctionName(tokens, start - 1);
  return (checkIsGoPunctuation(tokens[start - 1], ":=") || checkIsGoPunctuation(tokens[start - 1], "=")) &&
    tokens[start - 2]?.kind === GoTokenKind.Identifier
    ? tokens[start - 2]?.text
    : undefined;
};
