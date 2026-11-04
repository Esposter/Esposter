import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyLogicContext } from "survey-logic";

import { getSurveyPageViews } from "#src/services/runner/getSurveyPageViews";

// The indexes of the pages to show, over values a caller already holds, so they are not computed a second time
export const getSurveyVisiblePageIndexesFromValues = (
  document: SurveyDocument,
  values: SurveyLogicContext["values"],
  now: Date,
): number[] =>
  document.content.flatMap((_node, index) =>
    getSurveyPageViews(document, index, values, now).length > 0 ? [index] : [],
  );
