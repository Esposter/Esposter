import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";

// A `%` after an operand is the postfix percentage operator, which takes no factor after it (`checkIsFactorStart`)
export const parsePercentage: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  const node = parse(state, MathExpressionGrammarRule.Unary);
  if (state.error !== null || !checkIsToken(state, "%")) return node;

  getMathExpressionToken(state);
  return { operand: node, type: MathExpressionNodeType.Percentage };
};
