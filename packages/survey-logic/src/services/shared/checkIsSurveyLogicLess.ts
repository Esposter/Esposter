import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { compareSurveyLogicTexts } from "#src/services/shared/compareSurveyLogicTexts";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";
import { toSurveyLogicPrimitive } from "#src/services/shared/toSurveyLogicPrimitive";

// The less-than of two values (R7, R12). An empty value is never ordered, and two values that read as numbers compare as numbers.
// Two texts compare by code point, and a number is never ordered against a text that is not a number. A boolean, a record
// And any other pair are never ordered either. Greater is this with the sides swapped
export const checkIsSurveyLogicLess = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  const leftPrimitive = toSurveyLogicPrimitive(left);
  const rightPrimitive = toSurveyLogicPrimitive(right);
  if (checkIsSurveyLogicValueEmpty(leftPrimitive) || checkIsSurveyLogicValueEmpty(rightPrimitive)) return false;

  const leftNumber = toSurveyLogicNumber(leftPrimitive);
  const rightNumber = toSurveyLogicNumber(rightPrimitive);
  if (leftNumber !== undefined && rightNumber !== undefined) return leftNumber < rightNumber;
  if (leftNumber !== undefined && typeof rightPrimitive === "string") return false;
  if (rightNumber !== undefined && typeof leftPrimitive === "string") return false;
  if (typeof leftPrimitive === "string" && typeof rightPrimitive === "string")
    return compareSurveyLogicTexts(leftPrimitive, rightPrimitive) < 0;

  return false;
};
