import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

import { getSurveyVisiblePageIndexes } from "#src/services/runner/getSurveyVisiblePageIndexes";

// Moves back to the previous page with an element on it. Moving back never validates, so a respondent can leave a page with errors
export const goToPreviousSurveyPage = (
  document: SurveyDocument,
  state: SurveyRunnerState,
  now: Date,
): SurveyRunnerState => {
  const previousPageIndex = getSurveyVisiblePageIndexes(document, state.answers, now).findLast(
    (pageIndex) => pageIndex < state.pageIndex,
  );
  return previousPageIndex === undefined ? state : { ...state, pageIndex: previousPageIndex };
};
