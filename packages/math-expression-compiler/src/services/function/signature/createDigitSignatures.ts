import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { roundToDigits } from "#src/services/function/roundToDigits";
import { createRangedSignatures } from "#src/services/function/signature/createRangedSignatures";

// A rounding takes a value and an optional count of decimal places, and its scalar forms round to none and to the given count
export const createDigitSignatures = (rounder: (value: number) => number): MathExpressionSignature[] =>
  createRangedSignatures(
    1,
    2,
    (values) => {
      const [value = Number.NaN, digits = 0] = values;
      return roundToDigits(rounder, value, digits);
    },
    {
      computeBinary: (value, digits) => roundToDigits(rounder, value, digits),
      computeUnary: (value) => roundToDigits(rounder, value, 0),
    },
  );
