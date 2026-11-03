import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { checkIsSurveyLogicValueEqual } from "#src/services/shared/checkIsSurveyLogicValueEqual";
import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";

// SurveyJS's containment, behind `contains` when `isContains` is true and `notcontains` when it is false.
// A list holds each item of the right side, a text holds the right side as a substring in any case.
// An empty side decides alone, and a record holds no text, so it contains nothing
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
  if (typeof left === "object") return !isContains;
  if (typeof left !== "string") return checkIsSurveyLogicContaining(toSurveyLogicText(left), right, isContains);
  if (!right) return false;

  const needle = toSurveyLogicText(right).toLowerCase();
  if (needle === "") return false;

  const isFound = left.toLowerCase().includes(needle);
  return isContains ? isFound : !isFound;
};
