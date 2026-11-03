import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

// A session's starting state, its page clamped into the document's pages so a stored index past the last page opens the last one
export const createSurveyRunnerState = (
  document: SurveyDocument,
  answers: SurveyAnswers,
  pageIndex: number,
): SurveyRunnerState => {
  const lastPageIndex = Math.max(document.content.length - 1, 0);
  return { answers, isCompleted: false, pageIndex: Math.min(Math.max(pageIndex, 0), lastPageIndex) };
};
