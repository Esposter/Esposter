import type { SurveyExpressionTokenizerState } from "#src/models/SurveyExpressionTokenizerState";

import { SurveyExpressionTokenType } from "#src/models/SurveyExpressionTokenType";
import { PUNCTUATION_CHARACTERS, SYMBOL_OPERATOR_TEXTS } from "#src/services/constants";

// Punctuation is one character. An operator is the longest symbol the operator maps spell at the cursor, so `<=` is one
// Operator, and `1<-2` is `<` then `-`
export const readSurveyExpressionSymbol = (state: SurveyExpressionTokenizerState): void => {
  const character = state.source.charAt(state.index);
  if (PUNCTUATION_CHARACTERS.includes(character)) {
    state.tokens.push({ position: state.index, text: character, type: SurveyExpressionTokenType.Punctuation });
    state.index++;
    return;
  }

  const symbol = SYMBOL_OPERATOR_TEXTS.find((symbolText) => state.source.startsWith(symbolText, state.index));
  if (symbol === undefined) {
    state.error = { message: `Unexpected character ${character}`, position: state.index };
    return;
  }

  state.tokens.push({ position: state.index, text: symbol, type: SurveyExpressionTokenType.Operator });
  state.index += symbol.length;
};
