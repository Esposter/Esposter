import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

// The loose equality JavaScript gives two values that are not lists or both texts.
// An unanswered value equals only another unanswered one, values of one type compare directly.
// A number and a boolean meet as numbers
export const checkIsSurveyLogicPrimitiveEqual = (left: SurveyLogicValue, right: SurveyLogicValue): boolean => {
  if (left === undefined) return right === undefined;
  if (right === undefined) return false;
  if (typeof left === typeof right) return left === right;

  return Number(left) === Number(right);
};
