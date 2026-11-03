import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { toSurveyLogicDate } from "#src/services/shared/toSurveyLogicDate";

// The clock's moment, as a date and time
export const currentDateFunction: SurveyLogicFunction = (_args, context) => toSurveyLogicDate(context.now);
