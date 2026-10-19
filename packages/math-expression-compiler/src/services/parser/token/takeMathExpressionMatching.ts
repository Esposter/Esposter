import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { getMathExpressionCharacter } from "#src/services/parser/token/getMathExpressionCharacter";

// Takes the characters, from the current one, that the check accepts, and yields them as one slice of the source
export const takeMathExpressionMatching = (
  state: MathExpressionParserState,
  checkCharacter: (character: string) => boolean,
): string => {
  const start = state.index;
  while (checkCharacter(getMathExpressionCharacter(state, 0))) state.index++;
  return state.source.slice(start, state.index);
};
