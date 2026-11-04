import type { SurveyExpressionBinaryNode } from "#src/models/SurveyExpressionBinaryNode";
import type { SurveyExpressionEvaluate } from "#src/models/SurveyExpressionEvaluate";
import type { SurveyLogicContext } from "#src/models/SurveyLogicContext";
import type { SurveyLogicValue } from "#src/models/SurveyLogicValue";

import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import { evaluateArithmeticOperator } from "#src/services/evaluator/operators/evaluateArithmeticOperator";
import { evaluateComparisonOperator } from "#src/services/evaluator/operators/evaluateComparisonOperator";
import { evaluateLogicOperator } from "#src/services/evaluator/operators/evaluateLogicOperator";
import { evaluateMembershipOperator } from "#src/services/evaluator/operators/evaluateMembershipOperator";
import { exhaustiveGuard } from "@esposter/shared";

// Both operands are read before the operator applies.
// So a call on the right is read even when the left operand settles the result
export const evaluateBinary = (
  node: SurveyExpressionBinaryNode,
  context: SurveyLogicContext,
  evaluate: SurveyExpressionEvaluate,
): SurveyLogicValue => {
  const left = evaluate(node.left, context);
  const right = evaluate(node.right, context);
  switch (node.operator) {
    case SurveyExpressionBinaryOperator.Add:
    case SurveyExpressionBinaryOperator.Divide:
    case SurveyExpressionBinaryOperator.Modulo:
    case SurveyExpressionBinaryOperator.Multiply:
    case SurveyExpressionBinaryOperator.Power:
    case SurveyExpressionBinaryOperator.Subtract:
      return evaluateArithmeticOperator(node.operator, left, right);
    case SurveyExpressionBinaryOperator.AllOf:
    case SurveyExpressionBinaryOperator.AnyOf:
    case SurveyExpressionBinaryOperator.Contains:
    case SurveyExpressionBinaryOperator.NotContains:
      return evaluateMembershipOperator(node.operator, left, right);
    case SurveyExpressionBinaryOperator.And:
    case SurveyExpressionBinaryOperator.Or:
      return evaluateLogicOperator(node.operator, left, right);
    case SurveyExpressionBinaryOperator.Equal:
    case SurveyExpressionBinaryOperator.Greater:
    case SurveyExpressionBinaryOperator.GreaterOrEqual:
    case SurveyExpressionBinaryOperator.Less:
    case SurveyExpressionBinaryOperator.LessOrEqual:
    case SurveyExpressionBinaryOperator.NotEqual:
      return evaluateComparisonOperator(node.operator, left, right);
    default:
      return exhaustiveGuard(node.operator);
  }
};
