import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";

// The year of a date, which takes exactly one argument
export const getYearFunction: SurveyLogicFunction = (args) => {
  const [dateValue] = args;

  if (args.length !== 1 || !dateValue) return undefined;

  return parseSurveyLogicDate(dateValue).getFullYear();
};
