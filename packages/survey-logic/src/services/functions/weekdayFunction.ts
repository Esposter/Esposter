import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getDateOrNow } from "#src/services/shared/getDateOrNow";

// The day of the week of a date, from zero for Sunday, or of the clock's day when the date is empty
export const weekdayFunction: SurveyLogicFunction = (args, context) => getDateOrNow(args[0], context.now)?.getDay();
