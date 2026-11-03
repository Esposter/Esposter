import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// JavaScript's `>` over the values a survey holds: two texts compare as text, and anything else as numbers, so a text that
// Is not a number is never greater than one
export const checkIsSurveyValueGreater = (left: SurveyLogicValue, right: SurveyLogicValue): boolean =>
  typeof left === "string" && typeof right === "string" ? left > right : Number(left) > Number(right);
