import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { getDateDifference } from "#src/services/shared/getDateDifference";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";

// The whole years from a birthdate to the clock, or the time in the interval the argument names. A birthdate after the clock has no age
export const ageFunction: SurveyLogicFunction = ([birthdateValue, intervalValue], context) => {
  const birthdate = parseSurveyLogicDate(birthdateValue);
  const unit = checkIsSurveyLogicValueEmpty(intervalValue) ? "years" : intervalValue;
  if (birthdate === undefined || birthdate.getTime() > context.now.getTime() || typeof unit !== "string")
    return undefined;

  return getDateDifference(birthdate, context.now, unit);
};
