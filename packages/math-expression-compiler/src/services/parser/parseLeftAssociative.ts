import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { getMathExpressionOperator } from "#src/services/parser/getMathExpressionOperator";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";

// Parses operands joined by one rule's operators, which group from the left: `a - b - c` is `(a - b) - c`
export const parseLeftAssociative = <T extends string>(
  state: MathExpressionParserState,
  operators: Readonly<Record<string, T>>,
  parseOperand: () => MathExpressionNode,
  createNode: (left: MathExpressionNode, operator: T, right: MathExpressionNode) => MathExpressionNode,
): MathExpressionNode => {
  let node = parseOperand();
  let operator = getMathExpressionOperator(operators, state.token);
  while (state.error === null && operator !== undefined) {
    getMathExpressionToken(state);
    const right = parseOperand();
    node = createNode(node, operator, right);
    operator = getMathExpressionOperator(operators, state.token);
  }
  return node;
};
