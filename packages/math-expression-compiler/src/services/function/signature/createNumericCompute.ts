import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { toMathExpressionNumbers } from "#src/services/function/toMathExpressionNumbers";

export const createNumericCompute =
  (compute: MathExpressionNumberCompute): MathExpressionSignature["compute"] =>
  (values) =>
    compute(toMathExpressionNumbers(values));
