import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

// An expression's value as a number, or none where it has no value or its value is not a number
export const evaluateGoNumber = (
  expression: GoExpression,
  resolveName: (name: string) => GoValue | undefined,
): number | undefined => readGoNumber(evaluateGoExpression(expression, resolveName));
