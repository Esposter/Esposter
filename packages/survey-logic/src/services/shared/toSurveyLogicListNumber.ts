import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// A list reads as its text, so it is a number only when its text is one.
// A list of nothing, or of an unanswered item, has a blank text, which is no number.
// The list is read without the text rules, as SurveyJS reads it
export const toSurveyLogicListNumber = (list: SurveyLogicValue[]): number => {
  const text = String(list).trim();
  if (!text) return Number.NaN;

  const listNumber = Number(text);
  return Number.isFinite(listNumber) ? listNumber : Number.NaN;
};
