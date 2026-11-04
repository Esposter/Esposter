import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";

// An optional argument reads as its default when it is empty, and otherwise as its read makes of it.
// An empty argument is an absent one (the survey-expression design's 'Absent' bullet), so both read the default.
// Undefined when the read gives no result
export const getSurveyOptionalArgument = <T>(
  value: SurveyLogicValue,
  defaultValue: T,
  readArgument: (value: SurveyLogicValue) => T | undefined,
): T | undefined => (checkIsSurveyLogicValueEmpty(value) ? defaultValue : readArgument(value));
