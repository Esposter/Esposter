import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";
import { restoreMathExpressionParserState } from "#src/services/parser/restoreMathExpressionParserState";

// A `%` after an operand is a percentage unless an operand follows it, when it is the modulo operator
export const parsePercentage: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  const node = parse(state, MathExpressionGrammarRule.Unary);
  if (state.error !== null || !checkIsToken(state, "%")) return node;

  const snapshot = { ...state };
  getMathExpressionToken(state);
  // A sign after the sign is the start of the next term, so the percent sign is always a percentage before one
  const isSignNext = checkIsToken(state, "+") || checkIsToken(state, "-");
  if (!isSignNext) parse(state, MathExpressionGrammarRule.Unary);
  const isModulo = !isSignNext && state.error === null;
  restoreMathExpressionParserState(state, snapshot);
  if (isModulo) return node;

  getMathExpressionToken(state);
  return { operand: node, type: MathExpressionNodeType.Percentage };
};
