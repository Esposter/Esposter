import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionLogicalOperator } from "#src/models/shared/MathExpressionLogicalOperator";
import { UNARY_MINUS_NAME, UNARY_PLUS_NAME } from "#src/services/parser/constants";

// The operator tokens of each rule that has operators, each with the function a node names, or the logical operator a
// Logical node applies. The binary operators are in their own map, as they bind by power rather than by rule
export const MathExpressionOperatorMap: {
  [MathExpressionGrammarRule.Nullish]: Readonly<Record<string, MathExpressionLogicalOperator>>;
  [MathExpressionGrammarRule.Power]: Readonly<Record<string, string>>;
  [MathExpressionGrammarRule.Unary]: Readonly<Record<string, string>>;
} = {
  [MathExpressionGrammarRule.Nullish]: { "??": MathExpressionLogicalOperator.Nullish },
  [MathExpressionGrammarRule.Power]: { ".^": "dotPow", "^": "pow" },
  [MathExpressionGrammarRule.Unary]: { "+": UNARY_PLUS_NAME, "-": UNARY_MINUS_NAME, not: "not", "~": "bitNot" },
};
