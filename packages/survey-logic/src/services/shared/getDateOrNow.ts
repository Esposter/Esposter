import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { getSurveyOptionalArgument } from "#src/services/shared/getSurveyOptionalArgument";
import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";
import { toSurveyLogicWallClock } from "#src/services/shared/toSurveyLogicWallClock";

// The date a getter reads: the clock's wall clock when the argument is empty, otherwise the date the argument names.
// Undefined when the argument names no date
export const getDateOrNow = (value: SurveyLogicValue, now: Date): Date | undefined =>
  getSurveyOptionalArgument(value, toSurveyLogicWallClock(now), parseSurveyLogicDate);
