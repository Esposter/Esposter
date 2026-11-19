import type { Context } from "#server/trpc/context";
import type { ReadSurveyResponsesCountResult } from "#shared/models/resource/survey/ReadSurveyResponsesCountResult";
import type { ResourceInResource } from "@esposter/db-schema";

import { readCappedCount } from "#server/services/db/readCappedCount";
import { getSurveyResponsesWhere } from "#server/services/survey/getSurveyResponsesWhere";
import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";
import { surveyResponsesInResource } from "@esposter/db-schema";

// The one response count, for the overview blade and the Responses dataset alike.
//
// The cap is the dataset's, not a page size: a survey between a page and the cap would otherwise read one total on the
// Overview and a different one on the Responses blade
export const readSurveyResponsesCount = (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
): Promise<ReadSurveyResponsesCountResult> =>
  readCappedCount(db, surveyResponsesInResource, getSurveyResponsesWhere(surveyId), DATASET_MAX_COUNTED_ROWS);
