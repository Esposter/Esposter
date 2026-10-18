import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

export const getMathExpressionCharacter = (state: MathExpressionParserState, offset: number): string =>
  state.source.charAt(state.index + offset);
