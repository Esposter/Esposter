import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";

// JavaScript's `<` on the values.
// Two texts compare by their code units, and anything else as numbers, so a text that is not a number is never below one
export const checkIsSurveyLogicBelow = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  const leftPrimitive = Array.isArray(left) ? toSurveyLogicText(left) : left;
  const rightPrimitive = Array.isArray(right) ? toSurveyLogicText(right) : right;
  if (typeof leftPrimitive === "string" && typeof rightPrimitive === "string") return leftPrimitive < rightPrimitive;

  return Number(leftPrimitive) < Number(rightPrimitive);
};
