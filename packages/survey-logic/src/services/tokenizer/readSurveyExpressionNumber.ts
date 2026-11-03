import type { SurveyExpressionTokenizerState } from "#src/models/SurveyExpressionTokenizerState";

import { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";
import { advanceSurveyExpressionWhile } from "#src/services/tokenizer/advanceSurveyExpressionWhile";
import { checkIsSurveyExpressionDigit } from "#src/services/tokenizer/checkIsSurveyExpressionDigit";

// A dot joins the digits only when a digit follows it, so `1.` is the number 1 and then a dot the tokenizer refuses
export const readSurveyExpressionNumber = (state: SurveyExpressionTokenizerState): void => {
  const start = state.index;
  advanceSurveyExpressionWhile(state, checkIsSurveyExpressionDigit);
  if (state.source.charAt(state.index) === "." && checkIsSurveyExpressionDigit(state.source.charAt(state.index + 1))) {
    state.index++;
    advanceSurveyExpressionWhile(state, checkIsSurveyExpressionDigit);
  }
  state.tokens.push({
    position: start,
    text: state.source.slice(start, state.index),
    type: SurveyExpressionTokenType.Number,
  });
};
