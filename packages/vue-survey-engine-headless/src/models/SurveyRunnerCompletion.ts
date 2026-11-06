import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyPageError } from "#src/models/SurveyPageError";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

// The result of completing a survey. With errors, they are the ones that blocked it, the state moves to the first page that failed, unfinished, and no answers are stored
// With none, the state is completed, and the answers hold only the visible questions and the calculated values the result includes
export interface SurveyRunnerCompletion {
  answers: SurveyAnswers;
  errors: SurveyPageError[];
  state: SurveyRunnerState;
}
