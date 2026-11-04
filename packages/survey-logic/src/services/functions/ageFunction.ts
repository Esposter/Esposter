import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { getDateDifference } from "#src/services/shared/getDateDifference";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";
import { toSurveyLogicWallClock } from "#src/services/shared/toSurveyLogicWallClock";

// The whole years from a birthdate to the clock, or the time in the interval the argument names. A birthdate after the clock has no age
export const ageFunction: SurveyLogicFunction = ([birthdateValue, intervalValue], context) => {
  const birthdate = parseSurveyLogicDate(birthdateValue);
  const now = toSurveyLogicWallClock(context.now);
  const unit = checkIsSurveyLogicValueEmpty(intervalValue) ? "years" : intervalValue;
  if (birthdate === undefined || birthdate.getTime() > now.getTime() || typeof unit !== "string") return undefined;

  return getDateDifference(birthdate, now, unit);
};
