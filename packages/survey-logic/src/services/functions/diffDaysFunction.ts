import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { getDaysBetween } from "#src/services/shared/getDaysBetween";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";

// The calendar days between two dates, whichever comes first. SurveyJS gives zero days when a date is missing
export const diffDaysFunction: SurveyLogicFunction = (args) => {
  const [fromValue, toValue] = args;

  if (args.length !== 2 || checkIsSurveyLogicValueEmpty(fromValue) || checkIsSurveyLogicValueEmpty(toValue)) return 0;

  return getDaysBetween(parseSurveyLogicDate(fromValue), parseSurveyLogicDate(toValue));
};
