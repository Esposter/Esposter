import type { MathExpressionParserState } from "#src/models/MathExpressionParserState";

import { failMathExpressionAt } from "#src/services/failMathExpressionAt";
import { getMathExpressionColumn } from "#src/services/getMathExpressionColumn";

export const failMathExpression = (state: MathExpressionParserState, message: string): void =>
  failMathExpressionAt(state, message, getMathExpressionColumn(state));
