import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getSurveyNumber } from "#src/services/shared/getSurveyNumber";
import { toSurveyLogicDate } from "#src/services/shared/toSurveyLogicDate";

// The clock's day at midnight, moved by a number of days when one is given
export const todayFunction: SurveyLogicFunction = (args, context) => {
  const date = new Date(context.now);

  date.setHours(0, 0, 0, 0);

  if (args.length === 1) {
    // An empty shift moves nothing, as SurveyJS reads it as zero
    const days = args[0] ? getSurveyNumber(args[0]) : 0;

    date.setDate(date.getDate() + days);
  }

  return toSurveyLogicDate(date);
};
