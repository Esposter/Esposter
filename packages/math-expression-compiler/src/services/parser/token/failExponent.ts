import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { failMathExpression } from "#src/services/parser/failMathExpression";
import { getMathExpressionCharacter } from "#src/services/parser/token/getMathExpressionCharacter";

// Reports a decimal mark where an exponent's digits must be, at the column the reported token starts at, as mathjs counts it
// For `2e.5` that column is char 2
export const failExponent = (state: MathExpressionParserState, text: string): void => {
  state.token = text;
  failMathExpression(state, `Digit expected, got "${getMathExpressionCharacter(state, 0)}"`);
};
