import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { computeExtreme } from "#src/services/function/computeExtreme";
import { createNonEmptyCompute } from "#src/services/function/signature/createNonEmptyCompute";
import { createSpreadSignatures } from "#src/services/function/signature/createSpreadSignatures";

// The largest or the smallest of a list, by the predicate that prefers one value over another, as max and min take it
export const createExtremeSignatures = (
  checkIsPreferred: (value: number, extreme: number) => boolean,
): MathExpressionSignature[] =>
  createSpreadSignatures(
    1,
    createNonEmptyCompute((values) => computeExtreme(values, values[0] ?? Number.NaN, checkIsPreferred)),
  );
