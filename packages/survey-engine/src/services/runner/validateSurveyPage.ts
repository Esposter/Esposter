import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyPageError } from "#src/models/SurveyPageError";
import type { SurveyRunnerState } from "#src/models/SurveyRunnerState";

import { getSurveyPageErrors } from "#src/services/runner/getSurveyPageErrors";
import { getSurveyRunnerValues } from "#src/services/runner/getSurveyRunnerValues";

// The errors on the state's current page, the reasons it cannot be left
export const validateSurveyPage = (document: SurveyDocument, state: SurveyRunnerState, now: Date): SurveyPageError[] =>
  getSurveyPageErrors(
    document,
    state.pageIndex,
    state.answers,
    getSurveyRunnerValues(document, state.answers, now),
    now,
  );
