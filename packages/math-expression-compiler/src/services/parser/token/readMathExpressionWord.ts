import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { NAMED_DELIMITERS, WORD_CHARACTER_REGEX } from "#src/services/parser/token/constants";
import { getMathExpressionCharacter } from "#src/services/parser/token/getMathExpressionCharacter";

export const readMathExpressionWord = (state: MathExpressionParserState): void => {
  const start = state.index;
  while (WORD_CHARACTER_REGEX.test(getMathExpressionCharacter(state, 0))) state.index++;
  state.token = state.source.slice(start, state.index);
  state.tokenType = NAMED_DELIMITERS.has(state.token)
    ? MathExpressionTokenType.Delimiter
    : MathExpressionTokenType.Symbol;
};
