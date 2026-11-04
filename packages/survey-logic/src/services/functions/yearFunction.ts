import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getDateOrNow } from "#src/services/shared/getDateOrNow";

// The year of a date, or of the clock's day when the date is empty
export const yearFunction: SurveyLogicFunction = (args, context) =>
  getDateOrNow(args[0], context.now)?.getUTCFullYear();
