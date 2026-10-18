import { MathExpressionConstantMap } from "#src/services/shared/MathExpressionConstantMap";

// The value of a constant name, or undefined where the name is not a constant
export const getMathExpressionConstant = (name: string): number | undefined =>
  Object.hasOwn(MathExpressionConstantMap, name) ? MathExpressionConstantMap[name] : undefined;
