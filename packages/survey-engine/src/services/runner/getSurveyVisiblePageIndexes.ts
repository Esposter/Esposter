import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyDocument } from "#src/models/SurveyDocument";

import { getSurveyPageViews } from "#src/services/runner/getSurveyPageViews";
import { getSurveyRunnerValues } from "#src/services/runner/getSurveyRunnerValues";

// The indexes of the pages with an element on them to show. A page is shown when its own condition holds and one of its elements is
export const getSurveyVisiblePageIndexes = (document: SurveyDocument, answers: SurveyAnswers, now: Date): number[] => {
  const values = getSurveyRunnerValues(document, answers, now);
  return document.content.flatMap((_node, index) =>
    getSurveyPageViews(document, index, values, now).length > 0 ? [index] : [],
  );
};
