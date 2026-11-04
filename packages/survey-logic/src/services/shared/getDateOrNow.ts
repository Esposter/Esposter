import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";
import { toSurveyLogicWallClock } from "#src/services/shared/toSurveyLogicWallClock";

// The date a getter reads: the clock's wall clock when the argument is empty, otherwise the date the argument names.
// Undefined when the argument names no date
export const getDateOrNow = (value: SurveyLogicValue, now: Date): Date | undefined =>
  checkIsSurveyLogicValueEmpty(value) ? toSurveyLogicWallClock(now) : parseSurveyLogicDate(value);
