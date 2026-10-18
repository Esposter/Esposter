import type { MathExpressionBinaryCompute } from "#src/models/function/MathExpressionBinaryCompute";

// A bitwise function of two operands. The left operand that decides the result answers it, and the right operand is
// Never read. An operand that is not an integer is an error
export const createBitwisePair =
  (absorbing: number, compute: (left: number, right: number) => number): MathExpressionBinaryCompute =>
  (left, right) => {
    if (left === absorbing) return absorbing;
    if (!Number.isInteger(left) || !Number.isInteger(right)) return null;

    return compute(left, right);
  };
