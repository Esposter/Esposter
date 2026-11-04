import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { getDateDifference } from "#src/services/shared/getDateDifference";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";

// The intervals counted in exact time, each as the length of one unit in milliseconds
const millisecondsPerUnitMap: Record<string, number> = { hours: 3_600_000, minutes: 60_000, seconds: 1000 };

// The time from one date to another in an interval, in days by default
export const dateDiffFunction: SurveyLogicFunction = (args) => {
  const [fromValue, toValue, intervalValue] = args;

  if (args.length < 2 || checkIsSurveyLogicValueEmpty(fromValue) || checkIsSurveyLogicValueEmpty(toValue))
    return undefined;

  const interval = intervalValue || "days";
  const from = parseSurveyLogicDate(fromValue);
  const to = parseSurveyLogicDate(toValue);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return undefined;

  const milliseconds = typeof interval === "string" ? getOwnValue(millisecondsPerUnitMap, interval) : undefined;

  if (milliseconds !== undefined) return Math.ceil(Math.abs(to.getTime() - from.getTime()) / milliseconds);

  return getDateDifference(from, to, interval);
};
