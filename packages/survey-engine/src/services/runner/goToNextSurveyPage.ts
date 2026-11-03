import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyRunnerMove } from "#src/models/SurveyRunnerMove";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

import { getSurveyVisiblePageIndexes } from "#src/services/runner/getSurveyVisiblePageIndexes";
import { validateSurveyPage } from "#src/services/runner/validateSurveyPage";

// Moves to the next page with an element on it, unless the current page has errors, which hold the respondent on it
// On the last page the state comes back unchanged, so a move past it is a no-op rather than an error
export const goToNextSurveyPage = (document: SurveyDocument, state: SurveyRunnerState, now: Date): SurveyRunnerMove => {
  const errors = validateSurveyPage(document, state, now);
  if (errors.length > 0) return { errors, state };

  const nextPageIndex = getSurveyVisiblePageIndexes(document, state.answers, now).find(
    (pageIndex) => pageIndex > state.pageIndex,
  );
  return { errors, state: nextPageIndex === undefined ? state : { ...state, pageIndex: nextPageIndex } };
};
