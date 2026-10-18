import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { checkIsWordCharacter } from "#src/services/parser/token/checkIsWordCharacter";
import { NAMED_DELIMITERS } from "#src/services/parser/token/constants";
import { takeMathExpressionMatching } from "#src/services/parser/token/takeMathExpressionMatching";

export const readMathExpressionWord = (state: MathExpressionParserState): void => {
  state.token = takeMathExpressionMatching(state, checkIsWordCharacter);
  state.tokenType = NAMED_DELIMITERS.has(state.token)
    ? MathExpressionTokenType.Delimiter
    : MathExpressionTokenType.Symbol;
};
