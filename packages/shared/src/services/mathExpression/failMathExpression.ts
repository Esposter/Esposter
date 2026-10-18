import type { MathExpressionParserState } from "#src/models/mathExpression/MathExpressionParserState";

import { MathExpressionError } from "#src/models/mathExpression/MathExpressionError";

// Keeps the first error met, with the character it starts at, counted from one as mathjs counts it
export const failMathExpression = (state: MathExpressionParserState, message: string): void => {
  if (state.error !== null) return;

  const column = state.index - state.token.length + 1;
  state.error = new MathExpressionError(`${message} (char ${column})`);
};
