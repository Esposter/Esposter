import type { MathExpressionResult } from "#src/models/compiler/MathExpressionResult";
import type { MathExpressionValue } from "#src/models/function/MathExpressionValue";

// An argument is a number, or the numbers of a list, so its evaluator yields either, or null where the argument is an error
export interface MathExpressionCompiledArgument {
  evaluate: (values: readonly number[], locals: MathExpressionResult[]) => MathExpressionValue | null;
  isConstant: boolean;
}
