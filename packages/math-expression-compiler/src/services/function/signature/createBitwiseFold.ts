import type { MathExpressionNumberCompute } from "#src/models/function/MathExpressionNumberCompute";

import { createBitwisePair } from "#src/services/function/signature/createBitwisePair";

// A bitwise function folds its operands left to right, each step as its pair. An operand that decides the result ends the
// Fold early. The operands after it are never read. Zero decides an and, and minus one decides an or.
// An operand that is not an integer is an error
export const createBitwiseFold = (
  absorbing: number,
  compute: (left: number, right: number) => number,
): MathExpressionNumberCompute => {
  const computePair = createBitwisePair(absorbing, compute);
  return (values) =>
    values
      .slice(1)
      .reduce<null | number>(
        (result, value) => (result === null ? null : computePair(result, value)),
        values[0] ?? Number.NaN,
      );
};
