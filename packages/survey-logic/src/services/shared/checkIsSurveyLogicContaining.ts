import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { checkIsSurveyLogicValueEqual } from "#src/services/shared/checkIsSurveyLogicValueEqual";
import { toSurveyLogicText } from "#src/services/shared/toSurveyLogicText";

// The containment `contains` tests (R7). A list holds each item of the right side, and a text holds the right side as a
// Substring in any case. An empty left side holds nothing, a record holds no text, and an empty needle is in nothing, so
// `notcontains` is the negation of this
export const checkIsSurveyLogicContaining = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  if (Array.isArray(left)) {
    if (left.length === 0) return false;

    const rightItems = Array.isArray(right) ? right : [right];
    return rightItems.every((item) => left.some((leftItem) => checkIsSurveyLogicValueEqual(leftItem, item)));
  }
  if (checkIsSurveyLogicValueEmpty(left) || typeof left === "object") return false;

  const needle = toSurveyLogicText(right).toLowerCase();
  if (needle === "") return false;

  return toSurveyLogicText(left).toLowerCase().includes(needle);
};
