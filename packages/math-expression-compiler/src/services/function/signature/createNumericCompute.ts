import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";
import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

export const createNumericCompute =
  (compute: MathExpressionNumberCompute): MathExpressionSignature["compute"] =>
  (values) =>
    compute(values.flat());
