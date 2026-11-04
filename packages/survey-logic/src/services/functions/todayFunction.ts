import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { toSurveyLogicDate } from "#src/services/shared/toSurveyLogicDate";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";

// The clock's day at midnight, moved by a number of days when one is given
export const todayFunction: SurveyLogicFunction = (args, context) => {
  const date = new Date(context.now);

  date.setHours(0, 0, 0, 0);

  if (args.length === 1) {
    // An empty shift moves nothing
    const days = checkIsSurveyLogicValueEmpty(args[0]) ? 0 : toSurveyLogicNumber(args[0]);
    if (days === undefined) return undefined;

    date.setDate(date.getDate() + days);
  }

  return toSurveyLogicDate(date);
};
