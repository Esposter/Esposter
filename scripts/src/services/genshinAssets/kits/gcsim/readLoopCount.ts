import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

// The count an expression of a loop's bound evaluates to, a whole number from zero, or none where the bound is not one
export const readLoopCount = (
  bound: string,
  resolveName: (name: string) => GoValue | undefined,
): number | undefined => {
  const tokens = tokenizeGo(bound);
  const { expression } = parseGoExpression(tokens, 0);
  const value = evaluateGoNumber(expression, resolveName);
  return value !== undefined && Number.isInteger(value) && value >= 0 ? value : undefined;
};
