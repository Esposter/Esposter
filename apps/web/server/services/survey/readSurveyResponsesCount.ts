import type { Context } from "#server/trpc/context";
import type { ReadSurveyResponsesCountResult } from "#shared/models/resource/survey/ReadSurveyResponsesCountResult";
import type { ResourceInResource } from "@esposter/db-schema";

import { readCappedCount } from "#server/services/db/readCappedCount";
import { getSurveyResponsesWhere } from "#server/services/survey/getSurveyResponsesWhere";
import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";
import { surveyResponsesInResource } from "@esposter/db-schema";

// The one response count, for the overview blade and the Responses dataset alike. It counts up to one row past the
// Cap — that extra row is what distinguishes exactly-cap from beyond-cap, which is the only thing isCapped needs to be
// Honest about.
//
// The cap is the dataset's, not a page size: a survey between a page and the cap would otherwise read one total on the
// Overview and a different one on the Responses blade
export const readSurveyResponsesCount = async (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
): Promise<ReadSurveyResponsesCountResult> => {
  const responseCount = await readCappedCount(
    db,
    surveyResponsesInResource,
    getSurveyResponsesWhere(surveyId),
    DATASET_MAX_COUNTED_ROWS + 1,
  );
  return responseCount > DATASET_MAX_COUNTED_ROWS
    ? { count: DATASET_MAX_COUNTED_ROWS, isCapped: true }
    : { count: responseCount, isCapped: false };
};
