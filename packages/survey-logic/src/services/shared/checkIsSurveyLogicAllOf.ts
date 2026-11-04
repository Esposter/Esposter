import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicContaining } from "#src/services/shared/checkIsSurveyLogicContaining";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";

// SurveyJS's `allof`, read by R7: every value on the right is in the left. An empty left side holds nothing, so it fails
// Any non-empty right side, and an empty list on the right is all of nothing
export const checkIsSurveyLogicAllOf = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  if (checkIsSurveyLogicValueEmpty(left) && !checkIsSurveyLogicValueEmpty(right)) return false;
  if (!Array.isArray(right)) return checkIsSurveyLogicContaining(left, right);

  return right.every((item) => checkIsSurveyLogicContaining(left, item));
};
