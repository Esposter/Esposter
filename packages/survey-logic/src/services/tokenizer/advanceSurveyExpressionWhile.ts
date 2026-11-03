import type { SurveyExpressionTokenizerState } from "#src/models/SurveyExpressionTokenizerState";

// Moves the cursor past each character the check accepts, and stops at the source's end
export const advanceSurveyExpressionWhile = (
  state: SurveyExpressionTokenizerState,
  checkCharacter: (character: string) => boolean,
): void => {
  while (state.index < state.source.length && checkCharacter(state.source.charAt(state.index))) state.index++;
};
