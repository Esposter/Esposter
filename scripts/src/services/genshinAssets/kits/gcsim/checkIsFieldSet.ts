import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

// Whether the field at the position is set on a variable, `ai.Mult = ...`: a `.` before the field, an `=` after it, and
// An identifier two tokens back
export const checkIsFieldSet = (tokens: readonly GoToken[], position: number): boolean =>
  checkIsGoPunctuation(tokens[position - 1], ".") &&
  checkIsGoPunctuation(tokens[position + 1], "=") &&
  tokens[position - 2]?.kind === GoTokenKind.Identifier;
