import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicPrimitiveEqual } from "#src/services/shared/checkIsSurveyLogicPrimitiveEqual";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { compareSurveyLogicItems } from "#src/services/shared/compareSurveyLogicItems";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { takeOne } from "@esposter/shared";

// The equality of two values (R7). Empty values equal each other and nothing else. A list compares item by item, each
// List sorted first when the order is ignored, so two lists that sort differently under case are unequal. A record
// Compares field by field, and two records with a different set of fields are unequal. Primitives compare as they do in
// `checkIsSurveyLogicPrimitiveEqual`
export const checkIsSurveyLogicValueEqual = (
  left: SurveyLogicValue,
  right: SurveyLogicValue,
  ignoreOrder = true,
): boolean => {
  const isLeftEmpty = checkIsSurveyLogicValueEmpty(left);
  if (isLeftEmpty || checkIsSurveyLogicValueEmpty(right)) return isLeftEmpty && checkIsSurveyLogicValueEmpty(right);
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;

    const leftItems = ignoreOrder ? left.toSorted(compareSurveyLogicItems) : left;
    const rightItems = ignoreOrder ? right.toSorted(compareSurveyLogicItems) : right;
    return leftItems.every((item, index) =>
      checkIsSurveyLogicValueEqual(item, takeOne(rightItems, index), ignoreOrder),
    );
  }
  if (Array.isArray(left) || Array.isArray(right)) return false;
  if (typeof left === "object" && typeof right === "object") {
    const leftKeys = Object.keys(left);
    return (
      leftKeys.length === Object.keys(right).length &&
      leftKeys.every((key) => checkIsSurveyLogicValueEqual(left[key], getOwnValue(right, key), ignoreOrder))
    );
  }
  if (typeof left === "object" || typeof right === "object") return false;

  return checkIsSurveyLogicPrimitiveEqual(left, right);
};
