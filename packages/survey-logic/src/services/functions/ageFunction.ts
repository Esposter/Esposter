import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { getDateDifference } from "#src/services/shared/getDateDifference";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";

// The whole years from a birthdate to the clock, or the whole months when the interval says so
export const ageFunction: SurveyLogicFunction = (args, context) => {
  const [birthdateValue, intervalValue] = args;

  if (checkIsSurveyLogicValueEmpty(birthdateValue)) return undefined;

  const birthdate = parseSurveyLogicDate(birthdateValue);
  if (Number.isNaN(birthdate.getTime())) return undefined;

  // SurveyJS measures a day count from the birthdate to no second date, which is zero
  if (intervalValue === "days") return 0;

  return getDateDifference(birthdate, context.now, intervalValue);
};
