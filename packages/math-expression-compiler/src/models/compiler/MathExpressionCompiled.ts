import type { MathExpressionEvaluator } from "#src/models/compiler/MathExpressionEvaluator";

// A compiled node: its evaluator, and whether it reads no variable and no assignment, so it is computed once
export interface MathExpressionCompiled {
  evaluate: MathExpressionEvaluator;
  isConstant: boolean;
}
