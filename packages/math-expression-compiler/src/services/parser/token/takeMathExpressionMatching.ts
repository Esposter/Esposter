import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { getMathExpressionCharacter } from "#src/services/parser/token/getMathExpressionCharacter";

// Takes the characters, from the current one, that the pattern matches, and yields them
export const takeMathExpressionMatching = (state: MathExpressionParserState, pattern: RegExp): string => {
  let taken = "";
  while (pattern.test(getMathExpressionCharacter(state, 0))) {
    taken += getMathExpressionCharacter(state, 0);
    state.index++;
  }
  return taken;
};
