import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicBelow } from "#src/services/shared/checkIsSurveyLogicBelow";
import { checkIsSurveyLogicComparable } from "#src/services/shared/checkIsSurveyLogicComparable";

// SurveyJS's less-than, which an unanswered side never satisfies. Its greater-than is this with the sides swapped
export const checkIsSurveyLogicLess = (left: SurveyLogicValue, right: SurveyLogicValue): boolean =>
  checkIsSurveyLogicComparable(left, right) && checkIsSurveyLogicBelow(left, right);
