import type { SurveyExpressionEvaluate } from "#src/models/SurveyExpressionEvaluate";
import type { SurveyExpressionUnaryNode } from "#src/models/SurveyExpressionUnaryNode";
import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import { SurveyExpressionUnaryOperator } from "#src/models/SurveyExpressionUnaryOperator";
import { evaluateArithmeticOperator } from "#src/services/evaluator/operators/evaluateArithmeticOperator";
import { checkIsSurveyLogicValueEmpty } from "#src/services/shared/checkIsSurveyLogicValueEmpty";
import { exhaustiveGuard } from "@esposter/shared";

// A unary minus is zero less its operand, so it reads an operand the way subtraction does
export const evaluateUnary = (
  node: SurveyExpressionUnaryNode,
  context: SurveyLogicContext,
  evaluate: SurveyExpressionEvaluate,
): SurveyLogicValue => {
  const operand = evaluate(node.operand, context);
  switch (node.operator) {
    case SurveyExpressionUnaryOperator.Empty:
      return checkIsSurveyLogicValueEmpty(operand);
    case SurveyExpressionUnaryOperator.Negate:
      return evaluateArithmeticOperator(SurveyExpressionBinaryOperator.Subtract, 0, operand);
    case SurveyExpressionUnaryOperator.Not:
      return operand !== true;
    case SurveyExpressionUnaryOperator.NotEmpty:
      return !checkIsSurveyLogicValueEmpty(operand);
    default:
      return exhaustiveGuard(node.operator);
  }
};
