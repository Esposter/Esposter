import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getDateOrNow } from "#src/services/shared/getDateOrNow";

// The month of a date, from one for January, or of the clock's day when the date is empty
export const monthFunction: SurveyLogicFunction = (args, context) => {
  const date = getDateOrNow(args[0], context.now);

  return date === undefined ? undefined : date.getMonth() + 1;
};
