import type { MathExpressionParserState } from "#src/models/MathExpressionParserState";

import { MathExpressionError } from "#src/models/MathExpressionError";

// Keeps the first error met, at the character it is given
export const failMathExpressionAt = (state: MathExpressionParserState, message: string, column: number): void => {
  if (state.error !== null) return;

  state.error = new MathExpressionError(`${message} (char ${column})`);
};
