import type { SurveyConditionRow } from "@/models/resource/survey/SurveyConditionRow";
import type { SurveyExpressionNode } from "survey-expression";

import { SurveyConditionOperator } from "@/models/resource/survey/SurveyConditionOperator";
import { SURVEY_CONDITION_BINARY_OPERATORS } from "@/services/resource/survey/constants";
import { toSurveyConditionValue } from "@/services/resource/survey/toSurveyConditionValue";
import { SurveyExpressionNodeType, SurveyExpressionUnaryOperator } from "survey-expression";

// A reference compared with a literal, or a reference tested for being empty, read back as the row it was built from.
// Any other shape is not a row
export const toSurveyConditionRow = (node: SurveyExpressionNode): SurveyConditionRow | undefined => {
  if (node.type === SurveyExpressionNodeType.Binary) {
    const operator = SURVEY_CONDITION_BINARY_OPERATORS[node.operator];
    const value = toSurveyConditionValue(node.right);
    if (operator === undefined || value === undefined) return undefined;
    if (node.left.type !== SurveyExpressionNodeType.Reference) return undefined;

    return { operator, questionName: node.left.name, value };
  }

  if (node.type !== SurveyExpressionNodeType.Unary) return undefined;
  if (node.operand.type !== SurveyExpressionNodeType.Reference) return undefined;
  if (node.operator === SurveyExpressionUnaryOperator.Empty)
    return { operator: SurveyConditionOperator.Empty, questionName: node.operand.name, value: "" };
  if (node.operator === SurveyExpressionUnaryOperator.NotEmpty)
    return { operator: SurveyConditionOperator.NotEmpty, questionName: node.operand.name, value: "" };

  return undefined;
};
