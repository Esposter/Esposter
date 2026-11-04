import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import { checkIsSurveyLogicAllOf } from "#src/services/shared/checkIsSurveyLogicAllOf";
import { checkIsSurveyLogicAnyOf } from "#src/services/shared/checkIsSurveyLogicAnyOf";
import { checkIsSurveyLogicContaining } from "#src/services/shared/checkIsSurveyLogicContaining";
import { exhaustiveGuard } from "@esposter/shared";

// Membership is boolean, and `notcontains` is the negation of `contains`
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
      return checkIsSurveyLogicContaining(left, right);
    case SurveyExpressionBinaryOperator.NotContains:
      return !checkIsSurveyLogicContaining(left, right);
    default:
      return exhaustiveGuard(operator);
  }
};
