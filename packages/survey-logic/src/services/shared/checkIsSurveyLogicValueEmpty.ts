import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// Zero and false are answers, so only the falsy values that are neither are empty.
// An unanswered question, an empty text and NaN are empty, and so is an empty list
export const checkIsSurveyLogicValueEmpty = (value: SurveyLogicValue): boolean =>
  (Array.isArray(value) && value.length === 0) || (!value && value !== 0 && value !== false);
