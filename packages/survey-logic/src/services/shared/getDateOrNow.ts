import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";

// The date a getter reads: the date its argument names, or the clock's moment when the argument is empty
export const getDateOrNow = (value: SurveyLogicValue, now: Date): Date => (value ? parseSurveyLogicDate(value) : now);
