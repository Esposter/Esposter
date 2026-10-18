import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

// The character the current token starts at, counted from one as mathjs counts it
export const getMathExpressionColumn = (state: MathExpressionParserState): number =>
  state.index - state.token.length + 1;
