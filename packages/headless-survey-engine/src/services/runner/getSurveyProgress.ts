import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyProgress } from "#src/models/SurveyProgress";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

import { getSurveyVisiblePageIndexes } from "#src/services/runner/getSurveyVisiblePageIndexes";

// The state's place among the pages the respondent will see: the count of shown pages up to and including the current one, and the total.
// A current page that is hidden counts the shown pages before it, so the position never names a page that is not shown
export const getSurveyProgress = (document: SurveyDocument, state: SurveyRunnerState, now: Date): SurveyProgress => {
  const pageIndexes = getSurveyVisiblePageIndexes(document, state.answers, now);
  return { current: pageIndexes.filter((pageIndex) => pageIndex <= state.pageIndex).length, total: pageIndexes.length };
};
