import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyLogicContext } from "survey-logic";

import { getSurveyPageViews } from "#src/services/runner/getSurveyPageViews";
import { getSurveyRunnerValues } from "#src/services/runner/getSurveyRunnerValues";

// The indexes of the pages with an element on them to show. A page is shown when its own condition holds and one of its elements is
export const getSurveyVisiblePageIndexes = (document: SurveyDocument, answers: SurveyAnswers, now: Date): number[] =>
  getSurveyVisiblePageIndexesFromValues(document, getSurveyRunnerValues(document, answers, now), now);

// The same indexes, over values a caller already holds from the answers, so they are not computed a second time
export const getSurveyVisiblePageIndexesFromValues = (
  document: SurveyDocument,
  values: SurveyLogicContext["values"],
  now: Date,
): number[] =>
  document.content.flatMap((_node, index) =>
    getSurveyPageViews(document, index, values, now).length > 0 ? [index] : [],
  );
