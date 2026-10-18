import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { MathExpressionTokenType } from "#src/models/parser/MathExpressionTokenType";
import { DELIMITERS_OF_ONE, DELIMITERS_OF_THREE, DELIMITERS_OF_TWO } from "#src/services/parser/token/constants";
import { getMathExpressionCharacter } from "#src/services/parser/token/getMathExpressionCharacter";

// Reads the delimiter at the current character into the state, and yields how many characters it takes, or zero when none is one
export const readMathExpressionDelimiter = (state: MathExpressionParserState): number => {
  const threeCharacters = state.source.slice(state.index, state.index + 3);
  const twoCharacters = state.source.slice(state.index, state.index + 2);
  const oneCharacter = getMathExpressionCharacter(state, 0);
  let length = 0;
  if (DELIMITERS_OF_THREE.has(threeCharacters)) length = 3;
  else if (DELIMITERS_OF_TWO.has(twoCharacters)) length = 2;
  else if (DELIMITERS_OF_ONE.has(oneCharacter)) length = 1;
  if (length === 0) return 0;

  state.token = state.source.slice(state.index, state.index + length);
  state.index += length;
  state.tokenType = MathExpressionTokenType.Delimiter;
  if (state.token === "(" || state.token === "[") state.nestingLevel++;
  if (state.token === ")" || state.token === "]") state.nestingLevel--;
  return length;
};
