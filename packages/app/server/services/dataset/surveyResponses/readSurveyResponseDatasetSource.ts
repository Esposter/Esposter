import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { Resource, SurveyResponseEntity } from "@esposter/db-schema";

import { surveyResourceSchema } from "#shared/models/resource/survey/SurveyResource";
import { parseSurveyModel } from "#shared/services/survey/parseSurveyModel";
import { getSurveyModelDatasetColumns } from "@@/server/services/dataset/surveyResponses/getSurveyModelDatasetColumns";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { readSurveyResponseEntities } from "@@/server/services/survey/readSurveyResponseEntities";
import { readSurveyResponsesCount } from "@@/server/services/survey/readSurveyResponsesCount";

// The one read behind both the dataset and the Responses blade, so a row and its key always come from
// The same snapshot — two independent reads could interleave a submit or a delete and drift apart.
// It carries the uncapped total too, so neither surface can show a truncated table without saying so
export const readSurveyResponseDatasetSource = async (
  surveyId: Resource["id"],
): Promise<{ columns: DatasetColumn[]; surveyResponses: SurveyResponseEntity[]; totalRows: number }> => {
  // The blob is written on first save, so a freshly created survey serves an empty dataset
  const content = await readResourceContent(surveyResourceSchema, surveyId);
  const columns = getSurveyModelDatasetColumns(parseSurveyModel(content?.model ?? ""));
  const { hasMore, surveyResponses } = await readSurveyResponseEntities(surveyId);
  // Counting is a bounded partition scan, so only a read that saw rows past the cap pays for it —
  // The one case where the caller needs to know what it is missing. `isCapped` is dropped here because
  // The truncation helper re-derives it from the total against the same ceiling
  const totalRows = hasMore ? (await readSurveyResponsesCount(surveyId)).count : surveyResponses.length;
  return { columns, surveyResponses, totalRows };
};
