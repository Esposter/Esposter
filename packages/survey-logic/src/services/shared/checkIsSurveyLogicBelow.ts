import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// JavaScript's `<` on the values.
// Two texts compare by their code units, and anything else as numbers, so a text that is not a number is never below one
export const checkIsSurveyLogicBelow = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  const leftPrimitive = Array.isArray(left) ? String(left) : left;
  const rightPrimitive = Array.isArray(right) ? String(right) : right;
  if (typeof leftPrimitive === "string" && typeof rightPrimitive === "string") return leftPrimitive < rightPrimitive;

  return Number(leftPrimitive) < Number(rightPrimitive);
};
