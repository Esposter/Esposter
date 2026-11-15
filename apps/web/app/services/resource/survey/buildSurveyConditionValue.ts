import type { SurveyConditionValue } from "#src/models/resource/survey/SurveyConditionValue";

import { quoteSurveyConditionString } from "#src/services/resource/survey/quoteSurveyConditionString";

// A string is quoted, and a number or a boolean is written as the text it is
export const buildSurveyConditionValue = (value: SurveyConditionValue): string =>
  typeof value === "string" ? quoteSurveyConditionString(value) : String(value);
