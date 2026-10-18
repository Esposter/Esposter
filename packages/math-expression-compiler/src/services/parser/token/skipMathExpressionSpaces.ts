import type { MathExpressionParserState } from "#src/models/parser/MathExpressionParserState";

import { getMathExpressionCharacter } from "#src/services/parser/token/getMathExpressionCharacter";

// Skips the spaces, tabs and no-break spaces, the comments that run to a line's end, and the line breaks inside brackets
export const skipMathExpressionSpaces = (state: MathExpressionParserState): void => {
  while (state.index < state.source.length) {
    const character = getMathExpressionCharacter(state, 0);
    if ([" ", "\t", " "].includes(character) || (character === "\n" && state.nestingLevel > 0)) state.index++;
    else if (character === "#")
      while (state.index < state.source.length && getMathExpressionCharacter(state, 0) !== "\n") state.index++;
    else break;
  }
};
