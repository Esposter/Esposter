import type { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";
import type { MathExpressionParse } from "#src/models/parser/MathExpressionParse";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { getOwnValue } from "#src/services/shared/getOwnValue";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";

// Parses operands of the operand rule joined by one rule's operators, which group from the left: `a - b - c` is
// `(a - b) - c`. The operand is parsed by its rule rather than a callback, so a level allocates nothing per operand
export const parseLeftAssociative = <T extends string>(
  state: MathExpressionParserState,
  parse: MathExpressionParse,
  operators: Readonly<Record<string, T>>,
  operandRule: MathExpressionGrammarRule,
  createNode: (left: MathExpressionNode, operator: T, right: MathExpressionNode) => MathExpressionNode,
): MathExpressionNode => {
  let node = parse(state, operandRule);
  let operator = getOwnValue(operators, state.token);
  while (state.error === null && operator !== undefined) {
    getMathExpressionToken(state);
    const right = parse(state, operandRule);
    node = createNode(node, operator, right);
    operator = getOwnValue(operators, state.token);
  }
  return node;
};
