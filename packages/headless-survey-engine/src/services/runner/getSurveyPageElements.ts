import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyElementView } from "#src/models/SurveyElementView";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

import { getSurveyPageViews } from "#src/services/runner/getSurveyPageViews";
import { getSurveyRunnerValues } from "#src/services/runner/getSurveyRunnerValues";

// The views of the elements on the state's current page, as the respondent sees them
export const getSurveyPageElements = (
  document: SurveyDocument,
  state: SurveyRunnerState,
  now: Date,
): SurveyElementView[] =>
  getSurveyPageViews(document, state.pageIndex, getSurveyRunnerValues(document, state.answers, now), now);
