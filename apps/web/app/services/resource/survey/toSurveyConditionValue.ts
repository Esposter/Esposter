import type { SurveyConditionValue } from "@/models/resource/survey/SurveyConditionValue";
import type { SurveyExpressionNode } from "survey-logic";

import { SurveyExpressionNodeType, SurveyExpressionUnaryOperator } from "survey-logic";

// A literal's value, and a minus before a number literal, which the expression language reads as a negation of it
export const toSurveyConditionValue = (node: SurveyExpressionNode): SurveyConditionValue | undefined => {
  if (node.type === SurveyExpressionNodeType.Literal) return node.value;
  if (node.type !== SurveyExpressionNodeType.Unary || node.operator !== SurveyExpressionUnaryOperator.Negate)
    return undefined;
  if (node.operand.type !== SurveyExpressionNodeType.Literal || typeof node.operand.value !== "number")
    return undefined;

  return -node.operand.value;
};
