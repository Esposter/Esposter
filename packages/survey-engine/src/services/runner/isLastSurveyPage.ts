import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

import { getSurveyVisiblePageIndexes } from "#src/services/runner/getSurveyVisiblePageIndexes";

// Whether no page after the state's current one has an element on it, so the next move would complete the survey
export const isLastSurveyPage = (document: SurveyDocument, state: SurveyRunnerState, now: Date): boolean =>
  !getSurveyVisiblePageIndexes(document, state.answers, now).some((pageIndex) => pageIndex > state.pageIndex);
