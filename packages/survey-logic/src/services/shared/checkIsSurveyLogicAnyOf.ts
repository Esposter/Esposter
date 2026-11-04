import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicContaining } from "#src/services/shared/checkIsSurveyLogicContaining";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";

// SurveyJS's `anyof`, read by R7: one of the values on the right is in the left. An empty list on the right is any of
// Nothing, and an empty side otherwise decides alone. A scalar on either side is read as the one-item list it would be
export const checkIsSurveyLogicAnyOf = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  if (Array.isArray(right) && right.length === 0) return false;

  const isLeftEmpty = checkIsSurveyLogicValueEmpty(left);
  if (isLeftEmpty && checkIsSurveyLogicValueEmpty(right)) return true;
  if (isLeftEmpty) return false;
  if (checkIsSurveyLogicValueEmpty(right)) return true;
  if (!Array.isArray(left)) return checkIsSurveyLogicContaining(right, left);
  if (!Array.isArray(right)) return checkIsSurveyLogicContaining(left, right);

  return right.some((item) => checkIsSurveyLogicContaining(left, item));
};
