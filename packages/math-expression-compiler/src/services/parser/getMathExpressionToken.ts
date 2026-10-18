import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { DIGIT_REGEX, WORD_START_REGEX } from "#src/services/parser/token/constants";
import { getMathExpressionCharacter } from "#src/services/parser/token/getMathExpressionCharacter";
import { readMathExpressionDelimiter } from "#src/services/parser/token/readMathExpressionDelimiter";
import { readMathExpressionNumber } from "#src/services/parser/token/readMathExpressionNumber";
import { readMathExpressionWord } from "#src/services/parser/token/readMathExpressionWord";
import { skipMathExpressionSpaces } from "#src/services/parser/token/skipMathExpressionSpaces";

// Reads the next token into the state, leaving it empty at the end of the formula.
// A token that starts with a digit, or a dot before one, is a number.
// A word is a name, or a delimiter when it is one of the named operators
export const getMathExpressionToken = (state: MathExpressionParserState): void => {
  state.token = "";
  state.tokenType = MathExpressionTokenType.Null;
  skipMathExpressionSpaces(state);
  if (state.index >= state.source.length || state.error !== null) return;

  const character = getMathExpressionCharacter(state, 0);
  const next = getMathExpressionCharacter(state, 1);
  if (DIGIT_REGEX.test(character) || (character === "." && DIGIT_REGEX.test(next))) readMathExpressionNumber(state);
  else if (WORD_START_REGEX.test(character)) readMathExpressionWord(state);
  else if (readMathExpressionDelimiter(state) === 0) {
    state.token = character;
    state.index++;
    state.tokenType = MathExpressionTokenType.Unknown;
  }
};
