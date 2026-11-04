import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";

// The date a getter reads: the date its argument names, or the clock's moment when the argument is empty.
// Undefined when the date reads as none
export const getDateOrNow = (value: SurveyLogicValue, now: Date): Date | undefined => {
  const date = value ? parseSurveyLogicDate(value) : now;

  return Number.isNaN(date.getTime()) ? undefined : date;
};
