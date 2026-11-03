import type { SurveyConditionValue } from "@/models/resource/survey/SurveyConditionValue";

import { quoteSurveyConditionString } from "@/services/resource/survey/quoteSurveyConditionString";

// A string is quoted, and a number or a boolean is written as the text it is
export const buildSurveyConditionValue = (value: SurveyConditionValue): string =>
  typeof value === "string" ? quoteSurveyConditionString(value) : String(value);
