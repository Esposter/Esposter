import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicContaining } from "#src/services/shared/checkIsSurveyLogicContaining";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";

// The allof test (R7, R11): the left holds every item of the right. An empty needle is all of anything, the one vacuous case
export const checkIsSurveyLogicAllOf = (left: SurveyLogicValue, right: SurveyLogicValue): boolean =>
  checkIsSurveyLogicValueEmpty(right) || checkIsSurveyLogicContaining(left, right);
