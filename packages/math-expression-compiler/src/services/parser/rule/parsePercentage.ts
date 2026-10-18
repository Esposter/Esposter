import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { checkIsUnaryStart } from "#src/services/parser/checkIsUnaryStart";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";

// A `%` after an operand is a percentage unless an operand follows it, when it is the modulo operator
export const parsePercentage: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  const node = parse(state, MathExpressionGrammarRule.Unary);
  if (state.error !== null || !checkIsToken(state, "%")) return node;

  const snapshot = { ...state };
  getMathExpressionToken(state);
  // A sign after the sign is the start of the next term, so the percent sign is always a percentage before one
  const isModulo =
    state.error === null && !checkIsToken(state, "+") && !checkIsToken(state, "-") && checkIsUnaryStart(state);
  if (isModulo) {
    Object.assign(state, snapshot);
    return node;
  }

  return { operand: node, type: MathExpressionNodeType.Percentage };
};
