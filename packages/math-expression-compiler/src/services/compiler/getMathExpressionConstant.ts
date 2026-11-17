import { MathExpressionConstantMap } from "#src/services/shared/MathExpressionConstantMap";
import { getOwnValue } from "@esposter/shared";

// The value of a constant name, or undefined where the name is not a constant
export const getMathExpressionConstant = (name: string): number | undefined =>
  getOwnValue(MathExpressionConstantMap, name);
