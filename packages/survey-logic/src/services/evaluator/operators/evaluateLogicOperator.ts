import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import { exhaustiveGuard } from "@esposter/shared";

// `and` and `or` are boolean: an operand counts only when it is `true`, and any other value counts as false (R8)
export const evaluateLogicOperator = (
  operator: SurveyExpressionBinaryOperator.And | SurveyExpressionBinaryOperator.Or,
  left: SurveyLogicValue,
  right: SurveyLogicValue,
): boolean => {
  switch (operator) {
    case SurveyExpressionBinaryOperator.And:
      return left === true && right === true;
    case SurveyExpressionBinaryOperator.Or:
      return left === true || right === true;
    default:
      return exhaustiveGuard(operator);
  }
};
