import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";
import { toSurveyLogicDate } from "#src/services/shared/toSurveyLogicDate";

// A value read as a date and written back in the form a date answer takes
export const getDateFunction: SurveyLogicFunction = (args) => {
  const [dateValue] = args;

  if (!dateValue) return undefined;

  return toSurveyLogicDate(parseSurveyLogicDate(dateValue));
};
