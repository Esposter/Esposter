import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicItemHeld } from "#src/services/shared/checkIsSurveyLogicItemHeld";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";

// The anyof test (R7, R11): the left holds one item of the right, a scalar right being one item. An empty needle is held by
// Nothing, so `anyof` of it is false
export const checkIsSurveyLogicAnyOf = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  if (checkIsSurveyLogicValueEmpty(right)) return false;

  const needleItems = Array.isArray(right) ? right : [right];
  return needleItems.some((item) => checkIsSurveyLogicItemHeld(left, item));
};
