import type { MathExpressionResult } from "#src/models/compiler/MathExpressionResult";

// Evaluates a compiled node against the values of the variables and the slots of the assigned names
export type MathExpressionEvaluator = (
  values: readonly number[],
  locals: MathExpressionResult[],
) => MathExpressionResult;
