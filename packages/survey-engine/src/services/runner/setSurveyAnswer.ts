import type { SurveyAnswerValue } from "#src/models/SurveyAnswerValue";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

import { checkSurveyAnswerEmpty } from "#src/services/runner/checkSurveyAnswerEmpty";

// The state with one answer set. An empty value removes the answer, so the record holds only answers somebody gave
export const setSurveyAnswer = (
  state: SurveyRunnerState,
  name: string,
  value?: SurveyAnswerValue,
): SurveyRunnerState => {
  const answers = Object.fromEntries(Object.entries(state.answers).filter(([answerName]) => answerName !== name));
  // The undefined test narrows the value for the record below, which the predicate's unknown parameter would not
  if (value === undefined || checkSurveyAnswerEmpty(value)) return { ...state, answers };

  return { ...state, answers: { ...answers, [name]: value } };
};
