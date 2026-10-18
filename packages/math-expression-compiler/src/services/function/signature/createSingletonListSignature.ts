import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";
import type { MathExpressionUnaryCompute } from "#src/models/function/MathExpressionUnaryCompute";

import { createListSignature } from "#src/services/function/signature/createListSignature";

// A function of one argument takes only a list of one number, the list form every such function of mathjs's takes
export const createSingletonListSignature = (compute: MathExpressionUnaryCompute): MathExpressionSignature =>
  createListSignature((values) => (values.length === 1 ? compute(values[0] ?? Number.NaN) : null));
