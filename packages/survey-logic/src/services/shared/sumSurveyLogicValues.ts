import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { addSurveyLogicValues } from "#src/services/shared/addSurveyLogicValues";
import { checkIsSurveyLogicNumber } from "#src/services/shared/checkIsSurveyLogicNumber";
import { roundSurveyLogicSum } from "#src/services/shared/roundSurveyLogicSum";
import { sumSurveyLogicListWithValue } from "#src/services/shared/sumSurveyLogicListWithValue";

// SurveyJS's `+`. Two values that read as numbers add as numbers rounded to their digits, unless one of them is a text.
// A list adds as its list does, and anything else adds as JavaScript adds it
export const sumSurveyLogicValues = (left: SurveyLogicValue, right: SurveyLogicValue): SurveyLogicValue => {
  if (!checkIsSurveyLogicNumber(left) || !checkIsSurveyLogicNumber(right)) {
    if (Array.isArray(left) && Array.isArray(right)) return [...left, ...right];
    if (Array.isArray(left)) return sumSurveyLogicListWithValue(left, right, true);
    if (Array.isArray(right)) return sumSurveyLogicListWithValue(right, left, false);

    return addSurveyLogicValues(left, right);
  }

  const sum = addSurveyLogicValues(left, right);
  return typeof sum === "number" ? roundSurveyLogicSum(left, right, sum) : sum;
};
