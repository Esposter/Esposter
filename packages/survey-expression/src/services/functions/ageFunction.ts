import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getDateDifference } from "#src/services/shared/getDateDifference";
import { getSurveyDateUnit } from "#src/services/shared/getSurveyDateUnit";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";
import { toSurveyLogicWallClock } from "#src/services/shared/toSurveyLogicWallClock";

// The whole years from a birthdate to the clock, or the time in the interval the argument names. A birthdate after the clock has no age
export const ageFunction: SurveyLogicFunction = ([birthdateValue, intervalValue], context) => {
  const birthdate = parseSurveyLogicDate(birthdateValue);
  const now = toSurveyLogicWallClock(context.now);
  const unit = getSurveyDateUnit(intervalValue, "years");
  if (birthdate === undefined || birthdate.getTime() > now.getTime() || unit === undefined) return undefined;

  return getDateDifference(birthdate, now, unit);
};
