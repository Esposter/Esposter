import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";

// Two primitives are equal when both are the same boolean, when both read as the same number, or when both are the same
// Text. A boolean equals nothing else, and a number equals a value only when that value reads as the same number
export const checkIsSurveyLogicPrimitiveEqual = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  if (typeof left === "boolean" || typeof right === "boolean") return left === right;

  const leftNumber = toSurveyLogicNumber(left);
  const rightNumber = toSurveyLogicNumber(right);
  if (leftNumber !== undefined || rightNumber !== undefined) return leftNumber === rightNumber;

  return left === right;
};
