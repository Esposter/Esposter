import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { readNumber } from "#src/services/genshinAssets/kits/gcsim/readNumber";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

// The count an expression of a loop's bound evaluates to, a whole number from zero, or none where the bound is not one
export const readLoopCount = (
  bound: string,
  resolveName: (name: string) => GoValue | undefined,
): number | undefined => {
  const value = readNumber(tokenizeGo(bound), 0, resolveName);
  return value !== undefined && Number.isInteger(value) && value >= 0 ? value : undefined;
};
