import type { MathExpressionFunction } from "#src/models/mathExpression/MathExpressionFunction";

import { MathExpressionFunctionMap } from "#src/services/mathExpression/MathExpressionFunctionMap";

// An own-key lookup, so a name the table does not hold is undefined rather than a property inherited from the prototype
export const getMathExpressionFunction = (name: string): MathExpressionFunction | undefined =>
  Object.hasOwn(MathExpressionFunctionMap, name) ? MathExpressionFunctionMap[name] : undefined;
