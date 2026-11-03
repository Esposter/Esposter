import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

const DATE_ONLY_REGEX = /\d{4}-\d{2}-\d{2}/u;

// A date-only string names a local day, so it is read at local midnight rather than at the UTC midnight the platform uses
const checkIsDateOnly = (text: string): boolean =>
  !(text.indexOf("T") > 0) && DATE_ONLY_REGEX.test(text) && !Number.isNaN(new Date(text).getTime());

// The date a value names as SurveyJS reads it: a string or a number of milliseconds, and an invalid date for anything else
export const parseSurveyLogicDate = (value: SurveyLogicValue): Date => {
  if (typeof value === "number") return new Date(value);
  if (typeof value !== "string") return new Date(Number.NaN);

  return new Date(checkIsDateOnly(value) ? `${value}T00:00:00` : value);
};
