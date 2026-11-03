import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import { checkIsSurveyLogicLess } from "#src/services/shared/checkIsSurveyLogicLess";
import { checkIsSurveyLogicValueEqual } from "#src/services/shared/checkIsSurveyLogicValueEqual";
import { exhaustiveGuard } from "@esposter/shared";

// The comparisons are boolean. Greater is less with its sides swapped, and the or-equal forms take equality first
export const evaluateComparisonOperator = (
  operator:
    | SurveyExpressionBinaryOperator.Equal
    | SurveyExpressionBinaryOperator.Greater
    | SurveyExpressionBinaryOperator.GreaterOrEqual
    | SurveyExpressionBinaryOperator.Less
    | SurveyExpressionBinaryOperator.LessOrEqual
    | SurveyExpressionBinaryOperator.NotEqual,
  left: SurveyLogicValue,
  right: SurveyLogicValue,
): boolean => {
  switch (operator) {
    case SurveyExpressionBinaryOperator.Equal:
      return checkIsSurveyLogicValueEqual(left, right);
    case SurveyExpressionBinaryOperator.NotEqual:
      return !checkIsSurveyLogicValueEqual(left, right);
    case SurveyExpressionBinaryOperator.Greater:
      return checkIsSurveyLogicLess(right, left);
    case SurveyExpressionBinaryOperator.GreaterOrEqual:
      return checkIsSurveyLogicValueEqual(left, right) || checkIsSurveyLogicLess(right, left);
    case SurveyExpressionBinaryOperator.Less:
      return checkIsSurveyLogicLess(left, right);
    case SurveyExpressionBinaryOperator.LessOrEqual:
      return checkIsSurveyLogicValueEqual(left, right) || checkIsSurveyLogicLess(left, right);
    default:
      return exhaustiveGuard(operator);
  }
};
