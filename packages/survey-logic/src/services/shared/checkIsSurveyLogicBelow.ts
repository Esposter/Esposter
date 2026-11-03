import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicPrimitive } from "#src/services/shared/toSurveyLogicPrimitive";

// JavaScript's `<` on the values.
// Two texts compare by their code units, and anything else as numbers, so a text that is not a number is never below one
export const checkIsSurveyLogicBelow = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  const leftPrimitive = toSurveyLogicPrimitive(left);
  const rightPrimitive = toSurveyLogicPrimitive(right);
  if (typeof leftPrimitive === "string" && typeof rightPrimitive === "string") return leftPrimitive < rightPrimitive;

  return Number(leftPrimitive) < Number(rightPrimitive);
};
