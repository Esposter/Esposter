import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { failMathExpressionAt } from "#src/services/parser/failMathExpressionAt";
import { getMathExpressionColumn } from "#src/services/parser/getMathExpressionColumn";

export const failMathExpression = (state: MathExpressionParserState, message: string): void =>
  failMathExpressionAt(state, message, getMathExpressionColumn(state));
