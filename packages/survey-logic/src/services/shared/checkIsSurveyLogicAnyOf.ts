import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicContaining } from "#src/services/shared/checkIsSurveyLogicContaining";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";

// SurveyJS's `anyof`: one of the values on the right is in the left, and an empty side decides alone.
// A scalar on either side is read as the one-item list it would be
export const checkIsSurveyLogicAnyOf = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  const isLeftEmpty = checkIsSurveyLogicValueEmpty(left);
  if (isLeftEmpty && checkIsSurveyLogicValueEmpty(right)) return true;
  if (isLeftEmpty) return false;
  if (checkIsSurveyLogicValueEmpty(right)) return true;
  if (!Array.isArray(left)) return checkIsSurveyLogicContaining(right, left, true);
  if (!Array.isArray(right)) return checkIsSurveyLogicContaining(left, right, true);

  return right.some((item) => checkIsSurveyLogicContaining(left, item, true));
};
