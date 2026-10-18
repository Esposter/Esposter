import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";

// A bitwise function folds its operands left to right. An operand that decides the result ends the fold early.
// The operands after it are never read. Zero decides an and, and minus one decides an or.
// An operand that is not an integer is an error
export const createBitwiseFold =
  (absorbing: number, compute: (left: number, right: number) => number): MathExpressionNumberCompute =>
  (values) => {
    let result = values[0] ?? Number.NaN;
    for (const value of values.slice(1)) {
      if (result === absorbing) return absorbing;
      if (!Number.isInteger(result) || !Number.isInteger(value)) return null;

      result = compute(result, value);
    }
    return result;
  };
