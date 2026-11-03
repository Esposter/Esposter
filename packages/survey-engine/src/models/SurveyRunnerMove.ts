import type { SurveyPageError } from "#src/models/SurveyPageError";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

// The result of moving forward a page: the errors that blocked the move with the state unchanged, or no errors and the state on the next page
export interface SurveyRunnerMove {
  errors: SurveyPageError[];
  state: SurveyRunnerState;
}
