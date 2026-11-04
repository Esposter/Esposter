import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getDateDifference } from "#src/services/shared/getDateDifference";
import { getSurveyDateUnit } from "#src/services/shared/getSurveyDateUnit";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";

// The time from one date to another in an interval, in days by default. The dates may come in either order
export const dateDiffFunction: SurveyLogicFunction = ([fromValue, toValue, intervalValue]) => {
  const from = parseSurveyLogicDate(fromValue);
  const to = parseSurveyLogicDate(toValue);
  const unit = getSurveyDateUnit(intervalValue, "days");
  if (from === undefined || to === undefined || unit === undefined) return undefined;

  return getDateDifference(from, to, unit);
};
