import type { MathExpressionRuleParser } from "#src/models/parser/MathExpressionRuleParser";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { createLogicalNode } from "#src/services/parser/createLogicalNode";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";
import { MathExpressionOperatorMap } from "#src/services/parser/MathExpressionOperatorMap";
import { getOwnValue } from "#src/services/shared/getOwnValue";

// Nullish coalescing groups from the left, so `a ?? b ?? c` is `(a ?? b) ?? c`
export const parseNullish: MathExpressionRuleParser = (state, parse): MathExpressionNode => {
  const operators = MathExpressionOperatorMap[MathExpressionGrammarRule.Nullish];
  let node = parse(state, MathExpressionGrammarRule.LeftHand);
  let operator = getOwnValue(operators, state.token);
  while (state.error === null && operator !== undefined) {
    getMathExpressionToken(state);
    const right = parse(state, MathExpressionGrammarRule.LeftHand);
    node = createLogicalNode(node, operator, right);
    operator = getOwnValue(operators, state.token);
  }
  return node;
};
