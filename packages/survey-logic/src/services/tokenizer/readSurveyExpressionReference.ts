import type { SurveyExpressionTokenizerState } from "#src/models/SurveyExpressionTokenizerState";

import { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";

// A reference runs to the first closing brace, so a reference holds no brace and does not nest
export const readSurveyExpressionReference = (state: SurveyExpressionTokenizerState): void => {
  const start = state.index;
  const closing = state.source.indexOf("}", start);
  if (closing === -1) {
    state.error = { message: "Expected } to close the reference opened here", position: state.source.length };
    return;
  }

  const name = state.source.slice(start + 1, closing);
  if (name.trim() === "") {
    state.error = { message: "Expected a question name between { and }", position: closing };
    return;
  }

  state.index = closing + 1;
  state.tokens.push({ position: start, text: name, type: SurveyExpressionTokenType.Reference });
};
