import type { MathExpressionListForm } from "#src/models/MathExpressionListForm";

// A function of the table: its arguments as written, how it takes a list, and its computation, which yields null where
// Mathjs would throw. The evaluation turns that null into an error rather than a value
export interface MathExpressionFunction {
  compute: (...values: number[]) => null | number;
  listForm: MathExpressionListForm;
  maxArity: number;
  minArity: number;
}
