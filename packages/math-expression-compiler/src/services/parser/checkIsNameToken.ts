import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { getMathExpressionSignatures } from "#src/services/shared/getMathExpressionSignatures";

// A token that names a value: a symbol, or a named delimiter that a function takes, as `mod` and `not` are
export const checkIsNameToken = (state: MathExpressionParserState): boolean =>
  state.tokenType === MathExpressionTokenType.Symbol ||
  (state.tokenType === MathExpressionTokenType.Delimiter && getMathExpressionSignatures(state.token) !== undefined);
