import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { getSurveyNumber } from "#src/services/shared/getSurveyNumber";

// A field's value as an array function reads it: a text as its number, and a text that is not one as empty, so it is
// Skipped rather than joined. A list or a record is not a number either, and any other value stays as it is
export const getSurveyArrayValue = (value: SurveyLogicValue): SurveyLogicValue => {
  if (typeof value === "object") return undefined;
  if (typeof value !== "string") return value;

  const number = getSurveyNumber(value);
  return Number.isNaN(number) ? undefined : number;
};
