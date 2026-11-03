import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// Zero and false are answers, so only the falsy values that are neither are empty.
// An unanswered question, an empty text and NaN are empty, and so is an empty list.
// A record is empty when every one of its fields is, as SurveyJS reads one
export const checkIsSurveyLogicValueEmpty = (value: SurveyLogicValue): boolean => {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object" && value !== null)
    return Object.values(value).every((field) => checkIsSurveyLogicValueEmpty(field));

  return !value && value !== 0 && value !== false;
};
