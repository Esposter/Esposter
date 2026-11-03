import type { SurveyAnswers } from "#src/models/SurveyAnswers";

// Where a respondent's session stands: the answers given, the page index among all the document's pages, and whether it is complete
export interface SurveyRunnerState {
  answers: SurveyAnswers;
  isCompleted: boolean;
  pageIndex: number;
}
