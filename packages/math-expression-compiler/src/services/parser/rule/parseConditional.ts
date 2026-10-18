import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { PLACEHOLDER } from "#src/services/parser/constants";
import { failMathExpression } from "#src/services/parser/failMathExpression";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";

// The true branch is an assignment, so a conditional may nest inside it; the false branch is right associative
export const parseConditional: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  const condition = parse(state, MathExpressionGrammarRule.LogicalOr);
  if (state.error !== null || !checkIsToken(state, "?")) return condition;

  getMathExpressionToken(state);
  if (checkIsToken(state, ":")) {
    failMathExpression(state, "The true-expression of a conditional operator may not be empty");
    return PLACEHOLDER;
  }
  const whenTrue = parse(state, MathExpressionGrammarRule.Assignment);
  if (state.error === null && !checkIsToken(state, ":"))
    failMathExpression(state, "False part of conditional expression expected");

  if (state.error !== null) return PLACEHOLDER;

  getMathExpressionToken(state);
  const whenFalse = parse(state, MathExpressionGrammarRule.Conditional);
  return { condition, type: MathExpressionNodeType.Conditional, whenFalse, whenTrue };
};
