import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { checkIsSurveyLogicPrimitiveEqual } from "#src/services/shared/checkIsSurveyLogicPrimitiveEqual";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { getOwnValue } from "@esposter/shared";

// The equality of two values (R7).
// Empty values equal each other and nothing else.
// Two lists are equal when each item of the left pairs with a distinct equal item of the right.
// Their order does not matter.
// Two records are equal when each field either one holds is equal in both.
// A field one record lacks reads as absent.
// Primitives compare as `checkIsSurveyLogicPrimitiveEqual` compares them.
export const checkIsSurveyLogicValueEqual = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  const isLeftEmpty = checkIsSurveyLogicValueEmpty(left);
  if (isLeftEmpty || checkIsSurveyLogicValueEmpty(right)) return isLeftEmpty && checkIsSurveyLogicValueEmpty(right);
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;

    // Equality is an equivalence, so pairing each item with the first unpaired equal item decides it without a sort
    let unpairedItems = right;
    for (const item of left) {
      const index = unpairedItems.findIndex((rightItem) => checkIsSurveyLogicValueEqual(item, rightItem));
      if (index === -1) return false;

      unpairedItems = unpairedItems.toSpliced(index, 1);
    }
    return true;
  }
  if (Array.isArray(left) || Array.isArray(right)) return false;
  if (typeof left === "object" && typeof right === "object")
    return Object.keys({ ...left, ...right }).every((key) =>
      checkIsSurveyLogicValueEqual(getOwnValue(left, key), getOwnValue(right, key)),
    );
  if (typeof left === "object" || typeof right === "object") return false;

  return checkIsSurveyLogicPrimitiveEqual(left, right);
};
