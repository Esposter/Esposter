import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import { roundSurveyLogicProduct } from "#src/services/shared/roundSurveyLogicProduct";
import { roundSurveyLogicSum } from "#src/services/shared/roundSurveyLogicSum";
import { toSurveyLogicNumber } from "#src/services/shared/toSurveyLogicNumber";
import { toSurveyLogicResult } from "#src/services/shared/toSurveyLogicResult";
import { exhaustiveGuard } from "@esposter/shared";

// Arithmetic reads both operands as numbers, and an operand that reads as none has no result.
// `+` also joins two texts that are not numbers, and a division or a remainder by zero, read as a number, has no result either
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
  const leftNumber = toSurveyLogicNumber(left);
  const rightNumber = toSurveyLogicNumber(right);
  if (leftNumber === undefined || rightNumber === undefined) {
    const isJoin =
      operator === SurveyExpressionBinaryOperator.Add &&
      leftNumber === undefined &&
      rightNumber === undefined &&
      typeof left === "string" &&
      typeof right === "string" &&
      left !== "" &&
      right !== "";
    return isJoin ? left + right : undefined;
  }

  switch (operator) {
    case SurveyExpressionBinaryOperator.Add:
      return toSurveyLogicResult(roundSurveyLogicSum(leftNumber, rightNumber, leftNumber + rightNumber));
    case SurveyExpressionBinaryOperator.Divide:
      return rightNumber === 0 ? undefined : toSurveyLogicResult(leftNumber / rightNumber);
    case SurveyExpressionBinaryOperator.Modulo:
      return rightNumber === 0 ? undefined : toSurveyLogicResult(leftNumber % rightNumber);
    case SurveyExpressionBinaryOperator.Multiply:
      return toSurveyLogicResult(roundSurveyLogicProduct(leftNumber, rightNumber, leftNumber * rightNumber));
    case SurveyExpressionBinaryOperator.Power:
      return toSurveyLogicResult(leftNumber ** rightNumber);
    case SurveyExpressionBinaryOperator.Subtract:
      return toSurveyLogicResult(roundSurveyLogicSum(leftNumber, rightNumber, leftNumber - rightNumber));
    default:
      return exhaustiveGuard(operator);
  }
};
