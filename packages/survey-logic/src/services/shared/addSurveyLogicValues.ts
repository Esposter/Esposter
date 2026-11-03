import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// JavaScript's `+` on the values.
// A text on either side joins the two as text, a list reads as its text first, and anything else adds as numbers
export const addSurveyLogicValues = (left: SurveyLogicValue, right: SurveyLogicValue): SurveyLogicValue => {
  const leftPrimitive = Array.isArray(left) ? String(left) : left;
  const rightPrimitive = Array.isArray(right) ? String(right) : right;
  if (typeof leftPrimitive === "string" || typeof rightPrimitive === "string")
    return String(leftPrimitive) + String(rightPrimitive);

  return Number(leftPrimitive) + Number(rightPrimitive);
};
