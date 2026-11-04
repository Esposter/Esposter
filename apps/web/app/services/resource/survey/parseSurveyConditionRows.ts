import type { SurveyConditionRows } from "@/models/resource/survey/SurveyConditionRows";

import { SurveyConditionJoin } from "@/models/resource/survey/SurveyConditionJoin";
import { getSurveyConditionOperands } from "@/services/resource/survey/getSurveyConditionOperands";
import { toSurveyConditionRow } from "@/services/resource/survey/toSurveyConditionRow";
import { parseSurveyExpression, SurveyExpressionBinaryOperator, SurveyExpressionNodeType } from "survey-expression";

// The rows an expression reads as, joined by the one connective, or none when its shape is not rows. Empty text holds
// Always, so it reads as no rows at all, and a single comparison has no connective, so it is joined as `and`
export const parseSurveyConditionRows = (source: string): SurveyConditionRows | undefined => {
  if (source.trim() === "") return { join: SurveyConditionJoin.And, rows: [] };

  return parseSurveyExpression(source).match(
    (node) => {
      const isOr = node.type === SurveyExpressionNodeType.Binary && node.operator === SurveyExpressionBinaryOperator.Or;
      const operator = isOr ? SurveyExpressionBinaryOperator.Or : SurveyExpressionBinaryOperator.And;
      const operands = getSurveyConditionOperands(node, operator);
      const rows = operands.flatMap((operand) => {
        const row = toSurveyConditionRow(operand);
        return row ? [row] : [];
      });
      if (rows.length !== operands.length) return undefined;

      return { join: isOr ? SurveyConditionJoin.Or : SurveyConditionJoin.And, rows };
    },
    () => undefined,
  );
};
