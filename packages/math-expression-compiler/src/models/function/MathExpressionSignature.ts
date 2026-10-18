import type { MathExpressionBinaryCompute } from "#src/models/function/MathExpressionBinaryCompute";
import type { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";
import type { MathExpressionUnaryCompute } from "#src/models/function/MathExpressionUnaryCompute";
import type { MathExpressionValue } from "#src/models/function/MathExpressionValue";

// One way a function of the table takes its arguments: the kind each argument must be, the arities it takes, and its
// Computation of the argument values as one array, which yields null where mathjs would throw. The last parameter type
// Repeats for any arity past the list
export interface MathExpressionSignature {
  compute: (values: readonly MathExpressionValue[]) => null | number;
  // The scalar form of a signature of one number, which a call of one argument and a unary operator compute with no array
  computeUnary?: MathExpressionUnaryCompute;
  // The scalar form of a signature of two numbers, which a call of two arguments and a binary operator compute with no array
  computeBinary?: MathExpressionBinaryCompute;
  maxArity: number;
  minArity: number;
  parameters: MathExpressionParameterType[];
}
