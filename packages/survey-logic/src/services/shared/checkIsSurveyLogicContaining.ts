import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { checkIsSurveyLogicValueEqual } from "#src/services/shared/checkIsSurveyLogicValueEqual";
import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";

// The containment `contains` tests (R7, R11). A list holds each item of the right side, and a text holds the right side as an
// Exact substring, case included. An empty left side holds nothing, a record holds no text, and an empty needle is in nothing,
// So `notcontains` is the negation of this
export const checkIsSurveyLogicContaining = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  if (Array.isArray(left)) {
    if (left.length === 0) return false;

    const rightItems = Array.isArray(right) ? right : [right];
    return rightItems.every((item) => left.some((leftItem) => checkIsSurveyLogicValueEqual(leftItem, item)));
  }
  if (checkIsSurveyLogicValueEmpty(left) || typeof left === "object") return false;

  const needle = toSurveyLogicText(right);
  if (needle === "") return false;

  return toSurveyLogicText(left).includes(needle);
};
