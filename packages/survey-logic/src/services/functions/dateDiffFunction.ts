import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { getDateDifference } from "#src/services/shared/getDateDifference";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";

// The time from one date to another in an interval, in days by default. The dates may come in either order
export const dateDiffFunction: SurveyLogicFunction = ([fromValue, toValue, intervalValue]) => {
  const from = parseSurveyLogicDate(fromValue);
  const to = parseSurveyLogicDate(toValue);
  const unit = checkIsSurveyLogicValueEmpty(intervalValue) ? "days" : intervalValue;
  if (from === undefined || to === undefined || typeof unit !== "string") return undefined;

  return getDateDifference(from, to, unit);
};
