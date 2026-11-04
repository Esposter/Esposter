import type { SurveyExpressionBinaryOperator, SurveyExpressionNode } from "survey-expression";

import { SurveyExpressionNodeType } from "survey-expression";

// The operands a chain of one connective holds, read down its left side. A connective on the right is a group of its own,
// So it stays one operand, which the row conversion then refuses
export const getSurveyConditionOperands = (
  node: SurveyExpressionNode,
  operator: SurveyExpressionBinaryOperator,
): SurveyExpressionNode[] =>
  node.type === SurveyExpressionNodeType.Binary && node.operator === operator
    ? [...getSurveyConditionOperands(node.left, operator), node.right]
    : [node];
