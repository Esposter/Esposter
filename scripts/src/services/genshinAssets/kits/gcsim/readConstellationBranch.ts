import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";

// The constellation a block opening at a position is a branch of, `if c.Base.Cons >= N {`, which runs only from that
// Constellation on, else Undefined
export const readConstellationBranch = (tokens: readonly GoToken[], start: number): number | undefined =>
  tokens[start - 1]?.kind === GoTokenKind.Number &&
  checkIsGoPunctuation(tokens[start - 2], ">=") &&
  tokens[start - 3]?.text === "Cons" &&
  checkIsGoPunctuation(tokens[start - 4], ".") &&
  tokens[start - 5]?.text === "Base" &&
  checkIsGoPunctuation(tokens[start - 6], ".") &&
  tokens[start - 7]?.text === "c" &&
  tokens[start - 8]?.text === "if"
    ? Number(tokens[start - 1]?.text)
    : undefined;
