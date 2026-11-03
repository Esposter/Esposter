import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import { convertSurveyLogicOperands } from "#src/services/evaluator/operators/convertSurveyLogicOperands";
import { roundSurveyLogicProduct } from "#src/services/shared/roundSurveyLogicProduct";
import { roundSurveyLogicSum } from "#src/services/shared/roundSurveyLogicSum";
import { sumSurveyLogicValues } from "#src/services/shared/sumSurveyLogicValues";
import { exhaustiveGuard } from "@esposter/shared";

// Arithmetic reads both operands as numbers, except `+`, which joins text.
// A division or remainder by a falsy operand is empty rather than infinite or not a number, as SurveyJS gives it
export const evaluateArithmeticOperator = (
  operator:
    | SurveyExpressionBinaryOperator.Add
    | SurveyExpressionBinaryOperator.Divide
    | SurveyExpressionBinaryOperator.Modulo
    | SurveyExpressionBinaryOperator.Multiply
    | SurveyExpressionBinaryOperator.Power
    | SurveyExpressionBinaryOperator.Subtract,
  left: SurveyLogicValue,
  right: SurveyLogicValue,
): SurveyLogicValue => {
  const [convertedLeft, convertedRight] = convertSurveyLogicOperands(left, right);
  switch (operator) {
    case SurveyExpressionBinaryOperator.Add:
      return sumSurveyLogicValues(convertedLeft, convertedRight);
    case SurveyExpressionBinaryOperator.Subtract:
      return roundSurveyLogicSum(convertedLeft, convertedRight, Number(convertedLeft) - Number(convertedRight));
    case SurveyExpressionBinaryOperator.Multiply:
      return roundSurveyLogicProduct(convertedLeft, convertedRight, Number(convertedLeft) * Number(convertedRight));
    case SurveyExpressionBinaryOperator.Divide:
      return convertedRight ? Number(convertedLeft) / Number(convertedRight) : null;
    case SurveyExpressionBinaryOperator.Modulo:
      return convertedRight ? Number(convertedLeft) % Number(convertedRight) : null;
    case SurveyExpressionBinaryOperator.Power:
      return Number(convertedLeft) ** Number(convertedRight);
    default:
      return exhaustiveGuard(operator);
  }
};
