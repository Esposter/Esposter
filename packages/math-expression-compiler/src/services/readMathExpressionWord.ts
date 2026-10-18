import type { MathExpressionParserState } from "#src/models/MathExpressionParserState";

import { MathExpressionTokenType } from "#src/models/MathExpressionTokenType";
import { NAMED_DELIMITERS, WORD_CHARACTER_REGEX } from "#src/services/constants";
import { getMathExpressionCharacter } from "#src/services/getMathExpressionCharacter";

export const readMathExpressionWord = (state: MathExpressionParserState): void => {
  const start = state.index;
  while (state.index < state.source.length && WORD_CHARACTER_REGEX.test(getMathExpressionCharacter(state, 0)))
    state.index++;
  state.token = state.source.slice(start, state.index);
  state.tokenType = NAMED_DELIMITERS.has(state.token)
    ? MathExpressionTokenType.Delimiter
    : MathExpressionTokenType.Symbol;
};
