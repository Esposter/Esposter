import type { MathExpressionParameterType } from "#src/models/MathExpressionParameterType";
import type { MathExpressionValue } from "#src/models/MathExpressionValue";

// One way a function of the table takes its arguments: the kind each argument must be, the arities it takes, and its
// Computation of the argument values as one array, which yields null where mathjs would throw. The last parameter type
// Repeats for any arity past the list
export interface MathExpressionSignature {
  compute: (values: readonly MathExpressionValue[]) => null | number;
  maxArity: number;
  minArity: number;
  parameters: MathExpressionParameterType[];
}
