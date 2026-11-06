import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyDocument } from "#src/models/SurveyDocument";

import { getSurveyRunnerValues } from "#src/services/runner/getSurveyRunnerValues";
import { getSurveyVisiblePageIndexesFromValues } from "#src/services/runner/getSurveyVisiblePageIndexesFromValues";

// The indexes of the pages with an element on them to show. A page is shown when its own condition holds and one of its elements is
export const getSurveyVisiblePageIndexes = (document: SurveyDocument, answers: SurveyAnswers, now: Date): number[] =>
  getSurveyVisiblePageIndexesFromValues(document, getSurveyRunnerValues(document, answers, now), now);
