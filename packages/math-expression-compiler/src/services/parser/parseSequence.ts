import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { failMathExpression } from "#src/services/parser/failMathExpression";
import { checkIsToken } from "#src/services/parser/checkIsToken";
import { getMathExpressionToken } from "#src/services/parser/getMathExpressionToken";

// Parses the comma-separated items up to the closing bracket, which the caller then takes
export const parseSequence = (
  state: MathExpressionParserState,
  closing: string,
  parseItem: (state: MathExpressionParserState) => MathExpressionNode,
): MathExpressionNode[] => {
  const nodes: MathExpressionNode[] = [];
  if (checkIsToken(state, closing)) return nodes;

  while (state.error === null) {
    nodes.push(parseItem(state));
    if (!checkIsToken(state, ",")) break;
    getMathExpressionToken(state);
  }
  if (state.error === null && !checkIsToken(state, closing))
    failMathExpression(state, closing === ")" ? "Parenthesis ) expected" : "Parenthesis ] expected");
  return nodes;
};
