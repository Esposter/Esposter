import type { SurveyExpressionTokenizerState } from "#src/models/SurveyExpressionTokenizerState";

import { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";

// A backslash escapes only the quote and the backslash, so a backslash before any other character is kept as written
export const readSurveyExpressionString = (state: SurveyExpressionTokenizerState): void => {
  const start = state.index;
  const quote = state.source.charAt(start);
  let text = "";
  state.index++;
  while (state.index < state.source.length && state.source.charAt(state.index) !== quote) {
    const character = state.source.charAt(state.index);
    const nextCharacter = state.source.charAt(state.index + 1);
    if (character === "\\" && ["\\", quote].includes(nextCharacter)) {
      text += nextCharacter;
      state.index += 2;
    } else {
      text += character;
      state.index++;
    }
  }
  if (state.index >= state.source.length) {
    state.error = { message: `Expected ${quote} to close the string opened here`, position: state.source.length };
    return;
  }

  state.index++;
  state.tokens.push({ position: start, text, type: SurveyExpressionTokenType.String });
};
