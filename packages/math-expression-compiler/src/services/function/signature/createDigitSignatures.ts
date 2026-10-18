import type { MathExpressionSignature } from "#src/models/function/MathExpressionSignature";

import { MAXIMUM_DIGITS } from "#src/services/function/constants";
import { shiftDecimalPlaces } from "#src/services/function/shiftDecimalPlaces";
import { createRangedSignatures } from "#src/services/function/signature/createRangedSignatures";

export const createDigitSignatures = (rounder: (value: number) => number): MathExpressionSignature[] =>
  createRangedSignatures(1, 2, (values) => {
    const [value = Number.NaN, digits = 0] = values;
    if (!Number.isInteger(digits) || digits < 0 || digits > MAXIMUM_DIGITS) return null;
    if (!Number.isFinite(value)) return value;
    // Zero places is no shift, and the sum with zero gives the positive zero that the shifts give a rounded zero
    if (digits === 0) return rounder(value) + 0;
    return shiftDecimalPlaces(rounder(shiftDecimalPlaces(value, digits)), -digits);
  });
