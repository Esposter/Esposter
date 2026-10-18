import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import {
  DELIMITERS_OF_ONE,
  DELIMITERS_OF_THREE,
  DELIMITERS_OF_TWO,
  FIRST_CHARACTERS_OF_THREE,
  FIRST_CHARACTERS_OF_TWO,
} from "#src/services/parser/token/constants";
import { getMathExpressionCharacter } from "#src/services/parser/token/getMathExpressionCharacter";

// Reads the delimiter at the current character into the state, and yields how many characters it takes, or zero when none is one.
// The character decides which longer delimiters are looked up, so a read slices the source only where a longer one can start
export const readMathExpressionDelimiter = (state: MathExpressionParserState): number => {
  const character = getMathExpressionCharacter(state, 0);
  let length = 0;
  if (
    FIRST_CHARACTERS_OF_THREE.has(character) &&
    DELIMITERS_OF_THREE.has(state.source.slice(state.index, state.index + 3))
  )
    length = 3;
  else if (
    FIRST_CHARACTERS_OF_TWO.has(character) &&
    DELIMITERS_OF_TWO.has(state.source.slice(state.index, state.index + 2))
  )
    length = 2;
  else if (DELIMITERS_OF_ONE.has(character)) length = 1;
  if (length === 0) return 0;

  state.token = state.source.slice(state.index, state.index + length);
  state.index += length;
  state.tokenType = MathExpressionTokenType.Delimiter;
  if (["(", "["].includes(state.token)) state.nestingLevel++;
  if ([")", "]"].includes(state.token)) state.nestingLevel--;
  return length;
};
