import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { getDateOrNow } from "#src/services/shared/getDateOrNow";

// The day of the month of a date, or of the clock's day when the date is empty
export const dayFunction: SurveyLogicFunction = (args, context) => getDateOrNow(args[0], context.now).getDate();
