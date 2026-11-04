import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";

// An optional argument reads as its default when it is empty, and otherwise as its read makes of it, so an empty argument and
// An absent one are the same argument (R1). Undefined when the read gives no result
export const getSurveyOptionalArgument = <T>(
  value: SurveyLogicValue,
  defaultValue: T,
  readArgument: (value: SurveyLogicValue) => T | undefined,
): T | undefined => (checkIsSurveyLogicValueEmpty(value) ? defaultValue : readArgument(value));
