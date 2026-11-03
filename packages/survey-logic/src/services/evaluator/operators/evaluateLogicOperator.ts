import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import { convertSurveyLogicOperands } from "#src/services/evaluator/operators/convertSurveyLogicOperands";
import { exhaustiveGuard } from "@esposter/shared";

// `and` and `or` give the value of the operand that decides them, not a boolean, as SurveyJS's do
export const evaluateLogicOperator = (
  operator: SurveyExpressionBinaryOperator.And | SurveyExpressionBinaryOperator.Or,
  left: SurveyLogicValue,
  right: SurveyLogicValue,
): SurveyLogicValue => {
  const [convertedLeft, convertedRight] = convertSurveyLogicOperands(left, right);
  switch (operator) {
    case SurveyExpressionBinaryOperator.And:
      return convertedLeft && convertedRight;
    case SurveyExpressionBinaryOperator.Or:
      return convertedLeft || convertedRight;
    default:
      return exhaustiveGuard(operator);
  }
};
