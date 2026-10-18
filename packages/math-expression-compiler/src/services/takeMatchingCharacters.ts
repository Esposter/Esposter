import type { MathExpressionParserState } from "#src/models/MathExpressionParserState";

import { getMathExpressionCharacter } from "#src/services/getMathExpressionCharacter";

// Takes the characters, from the current one, that the pattern matches, and yields them
export const takeMatchingCharacters = (state: MathExpressionParserState, pattern: RegExp): string => {
  let taken = "";
  while (pattern.test(getMathExpressionCharacter(state, 0))) {
    taken += getMathExpressionCharacter(state, 0);
    state.index++;
  }
  return taken;
};
