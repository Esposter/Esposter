import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicItemHeld } from "#src/services/shared/checkIsSurveyLogicItemHeld";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";

// The containment `contains` tests (R7, R11): the left holds every item of the right, a scalar right being one item. An empty
// Needle is held by nothing, so `notcontains` is the negation of this. A list needle is never joined into one text
export const checkIsSurveyLogicContaining = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  if (checkIsSurveyLogicValueEmpty(right)) return false;

  const needleItems = Array.isArray(right) ? right : [right];
  return needleItems.every((item) => checkIsSurveyLogicItemHeld(left, item));
};
