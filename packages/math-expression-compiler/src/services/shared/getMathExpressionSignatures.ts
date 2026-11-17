import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { MathExpressionFunctionMap } from "#src/services/function/MathExpressionFunctionMap";
import { getOwnValue } from "@esposter/shared";

// The signatures of a function the table holds, or undefined for a name it does not
export const getMathExpressionSignatures = (name: string): MathExpressionSignature[] | undefined =>
  getOwnValue(MathExpressionFunctionMap, name);
