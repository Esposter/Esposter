import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicContaining } from "#src/services/shared/checkIsSurveyLogicContaining";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";

// SurveyJS's `allof`: every value on the right is in the left. An unanswered left side fails any non-empty right side
export const checkIsSurveyLogicAllOf = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  if (!left && !checkIsSurveyLogicValueEmpty(right)) return false;
  if (!Array.isArray(right)) return checkIsSurveyLogicContaining(left, right, true);

  return right.every((item) => checkIsSurveyLogicContaining(left, item, true));
};
