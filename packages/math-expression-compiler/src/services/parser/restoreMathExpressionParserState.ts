import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

export const restoreMathExpressionParserState = (
  state: MathExpressionParserState,
  snapshot: MathExpressionParserState,
): void => {
  Object.assign(state, snapshot);
};
