import type { Context } from "#server/trpc/context";
import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { ResourceInResource, SurveyResponseInResource } from "@esposter/db-schema";

import { readResourceContent } from "#server/services/resource/readResourceContent";
import { readSurveyResponseEntities } from "#server/services/survey/readSurveyResponseEntities";
import { readSurveyResponsesCount } from "#server/services/survey/readSurveyResponsesCount";
import { surveyResourceSchema } from "#shared/models/resource/survey/SurveyResource";
import { getSurveyDocumentDatasetColumns } from "#shared/services/dataset/surveyResponses/getSurveyDocumentDatasetColumns";

// The one read behind both the dataset and the Responses blade, so a row and its key always come from one snapshot.
// Two independent reads could interleave a submit or a delete and drift apart.
// It carries the total, and whether that total is a floor too.
// Neither surface can show a truncated table without saying so.
export const readSurveyResponseDatasetSource = async (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
): Promise<{
  columns: DatasetColumn[];
  isCountCapped: boolean;
  surveyResponses: SurveyResponseInResource[];
  totalRows: number;
}> => {
  // The blob is written on first save, so a freshly created survey serves an empty dataset
  const content = await readResourceContent(surveyResourceSchema, surveyId);
  const columns = content ? getSurveyDocumentDatasetColumns(content.document) : [];
  const { hasMore, surveyResponses } = await readSurveyResponseEntities(db, surveyId);
  // Counting is a bounded partition scan, so only a read that saw rows past the cap pays for it.
  // That is the one case where the caller needs to know what it is missing.
  const { count: totalRows, isCapped: isCountCapped } = hasMore
    ? await readSurveyResponsesCount(db, surveyId)
    : { count: surveyResponses.length, isCapped: false };
  return { columns, isCountCapped, surveyResponses, totalRows };
};
