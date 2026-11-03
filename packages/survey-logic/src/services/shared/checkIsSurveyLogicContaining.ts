import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { checkIsSurveyLogicValueEqual } from "#src/services/shared/checkIsSurveyLogicValueEqual";

// SurveyJS's containment, behind `contains` when `isContains` is true and `notcontains` when it is false.
// A list holds each item of the right side, a text holds the right side as a substring in any case.
// An empty side decides alone
export const checkIsSurveyLogicContaining = (
  left: SurveyLogicValue,
  right: SurveyLogicValue,
  isContains: boolean,
): boolean => {
  if (Array.isArray(left)) {
    if (left.length === 0) return !isContains;

    const rightItems = Array.isArray(right) ? right : [right];
    const isEveryItemFound = rightItems.every((item) =>
      left.some((leftItem) => checkIsSurveyLogicValueEqual(leftItem, item)),
    );
    return isEveryItemFound === isContains;
  }
  if (checkIsSurveyLogicValueEmpty(left)) return false;
  if (typeof left !== "string") return checkIsSurveyLogicContaining(String(left), right, isContains);
  if (!right) return false;

  const isFound = left.toLowerCase().includes(String(right).toLowerCase());
  return isContains ? isFound : !isFound;
};
