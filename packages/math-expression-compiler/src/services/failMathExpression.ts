import type { MathExpressionParserState } from "#src/models/MathExpressionParserState";

import { MathExpressionError } from "#src/models/MathExpressionError";

// The character the current token starts at, counted from one as mathjs counts it
export const getMathExpressionColumn = (state: MathExpressionParserState): number =>
  state.index - state.token.length + 1;

// Keeps the first error met, at the character it is given
export const failMathExpressionAt = (state: MathExpressionParserState, message: string, column: number): void => {
  if (state.error !== null) return;

  state.error = new MathExpressionError(`${message} (char ${column})`);
};

export const failMathExpression = (state: MathExpressionParserState, message: string): void =>
  failMathExpressionAt(state, message, getMathExpressionColumn(state));
