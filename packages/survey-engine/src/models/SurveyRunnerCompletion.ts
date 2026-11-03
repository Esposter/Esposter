import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyPageError } from "#src/models/SurveyPageError";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

// The result of completing a survey: the errors that blocked it with the state moved to the first page that failed, unfinished, or no errors, the completed state and
// The answers to store, which hold only the visible questions and the calculated values included in the result
export interface SurveyRunnerCompletion {
  answers: SurveyAnswers;
  errors: SurveyPageError[];
  state: SurveyRunnerState;
}
