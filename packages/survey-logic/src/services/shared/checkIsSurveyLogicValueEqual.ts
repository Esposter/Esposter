import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicPrimitiveEqual } from "#src/services/shared/checkIsSurveyLogicPrimitiveEqual";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { compareSurveyLogicItems } from "#src/services/shared/compareSurveyLogicItems";
import { getOwnValue } from "#src/services/shared/getOwnValue";
import { takeOne } from "@esposter/shared";

// SurveyJS's equality. A text compares trimmed and in lower case.
// A list compares item by item, each list sorted first when the order is ignored.
// Two lists that sort differently under case are unequal in SurveyJS too, so the sort is kept.
// A record compares field by field, and two records with a different set of fields are unequal.
// A number-reading comparison needs no step of its own, since the loose equality of two primitives reads the same numbers
export const checkIsSurveyLogicValueEqual = (
  left: SurveyLogicValue,
  right: SurveyLogicValue,
  ignoreOrder = true,
): boolean => {
  if (left === right) return true;
  if ((left === null || left === undefined) && right === "") return true;
  if ((right === null || right === undefined) && left === "") return true;
  if (typeof left === "string" && typeof right === "string")
    return left.trim().toLowerCase() === right.trim().toLowerCase();
  if (checkIsSurveyLogicValueEmpty(left) !== checkIsSurveyLogicValueEmpty(right)) return false;
  if (typeof left === "boolean" && typeof right === "string") return String(left) === right.toLowerCase();
  if (typeof right === "boolean" && typeof left === "string") return String(right) === left.toLowerCase();
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;

    const leftItems = ignoreOrder ? left.toSorted(compareSurveyLogicItems) : left;
    const rightItems = ignoreOrder ? right.toSorted(compareSurveyLogicItems) : right;
    return leftItems.every((item, index) =>
      checkIsSurveyLogicValueEqual(item, takeOne(rightItems, index), ignoreOrder),
    );
  }
  if (Array.isArray(left) || Array.isArray(right)) return false;
  if (typeof left === "object" && left !== null && typeof right === "object" && right !== null) {
    const leftKeys = Object.keys(left);
    return (
      leftKeys.length === Object.keys(right).length &&
      leftKeys.every((key) => checkIsSurveyLogicValueEqual(left[key], getOwnValue(right, key), ignoreOrder))
    );
  }

  return checkIsSurveyLogicPrimitiveEqual(left, right);
};
