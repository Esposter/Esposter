import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import { checkIsSurveyLogicAllOf } from "#src/services/shared/checkIsSurveyLogicAllOf";
import { checkIsSurveyLogicAnyOf } from "#src/services/shared/checkIsSurveyLogicAnyOf";
import { checkIsSurveyLogicContaining } from "#src/services/shared/checkIsSurveyLogicContaining";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { exhaustiveGuard } from "@esposter/shared";

// Membership is boolean.
// `notcontains` is also true for an unanswered left side against a right side with something in it.
// The containment check alone would not say so
export const evaluateMembershipOperator = (
  operator:
    | SurveyExpressionBinaryOperator.AllOf
    | SurveyExpressionBinaryOperator.AnyOf
    | SurveyExpressionBinaryOperator.Contains
    | SurveyExpressionBinaryOperator.NotContains,
  left: SurveyLogicValue,
  right: SurveyLogicValue,
): boolean => {
  switch (operator) {
    case SurveyExpressionBinaryOperator.AllOf:
      return checkIsSurveyLogicAllOf(left, right);
    case SurveyExpressionBinaryOperator.AnyOf:
      return checkIsSurveyLogicAnyOf(left, right);
    case SurveyExpressionBinaryOperator.Contains:
      return checkIsSurveyLogicContaining(left, right, true);
    case SurveyExpressionBinaryOperator.NotContains:
      return (!left && !checkIsSurveyLogicValueEmpty(right)) || checkIsSurveyLogicContaining(left, right, false);
    default:
      return exhaustiveGuard(operator);
  }
};
