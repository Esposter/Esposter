import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// Empty as SurveyJS reads it: an unanswered value, an empty text or list, and a record whose fields are all empty. Zero and
// False are answers
export const checkIsSurveyValueEmpty = (value: SurveyLogicValue): boolean => {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object" && value !== null)
    return Object.values(value).every((field) => checkIsSurveyValueEmpty(field));

  return !value && value !== 0 && value !== false;
};
