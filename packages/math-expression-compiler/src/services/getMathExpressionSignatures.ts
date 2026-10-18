import type { MathExpressionSignature } from "#src/models/MathExpressionSignature";

import { MathExpressionFunctionMap } from "#src/services/MathExpressionFunctionMap";

// An own-key lookup, so a name the table does not hold is undefined rather than a property inherited from the prototype
export const getMathExpressionSignatures = (name: string): MathExpressionSignature[] | undefined =>
  Object.hasOwn(MathExpressionFunctionMap, name) ? MathExpressionFunctionMap[name] : undefined;
