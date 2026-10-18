import { getOwnValue } from "#src/services/shared/getOwnValue";
import { MathExpressionConstantMap } from "#src/services/shared/MathExpressionConstantMap";

// The value of a constant name, or undefined where the name is not a constant
export const getMathExpressionConstant = (name: string): number | undefined =>
  getOwnValue(MathExpressionConstantMap, name);
