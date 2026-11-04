import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyOptionalArgument } from "#src/services/shared/getSurveyOptionalArgument";
import { toSurveyLogicDate } from "#src/services/shared/toSurveyLogicDate";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";
import { toSurveyLogicWallClock } from "#src/services/shared/toSurveyLogicWallClock";

// The clock's day at midnight, moved by a number of days when one is given
export const todayFunction: SurveyLogicFunction = (args, context) => {
  const date = toSurveyLogicWallClock(context.now);

  date.setUTCHours(0, 0, 0, 0);

  if (args.length === 1) {
    // An empty shift moves nothing
    const days = getSurveyOptionalArgument(args[0], 0, toSurveyLogicNumber);
    if (days === undefined) return undefined;

    date.setUTCDate(date.getUTCDate() + Math.trunc(days));
  }

  return toSurveyLogicDate(date);
};
