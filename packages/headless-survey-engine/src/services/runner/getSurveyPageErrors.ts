import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyPageError } from "#src/models/SurveyPageError";
import type { SurveyLogicContext } from "survey-expression";

import { flattenSurveyElementViews } from "#src/services/runner/flattenSurveyElementViews";
import { getSurveyPageViews } from "#src/services/runner/getSurveyPageViews";
import { getSurveyQuestionErrors } from "#src/services/runner/getSurveyQuestionErrors";

// The errors of the visible questions on the page at an index, in document order
export const getSurveyPageErrors = (
  document: SurveyDocument,
  pageIndex: number,
  answers: SurveyAnswers,
  values: SurveyLogicContext["values"],
  now: Date,
): SurveyPageError[] =>
  flattenSurveyElementViews(getSurveyPageViews(document, pageIndex, values, now)).flatMap((view) =>
    getSurveyQuestionErrors(view, answers, values, now),
  );
