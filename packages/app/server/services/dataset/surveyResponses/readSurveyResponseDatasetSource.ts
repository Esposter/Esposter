import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { Resource, SurveyResponseEntity } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { parseSurveyModel } from "#shared/services/survey/parseSurveyModel";
import { getSurveyModelDatasetColumns } from "@@/server/services/dataset/surveyResponses/getSurveyModelDatasetColumns";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { countSurveyResponseEntities } from "@@/server/services/survey/countSurveyResponseEntities";
import { readSurveyResponseEntities } from "@@/server/services/survey/readSurveyResponseEntities";
import { AZURE_MAX_PAGE_SIZE, ResourceType } from "@esposter/db-schema";

// The one read behind both the dataset and the Responses blade, so a row and its key always come from
// The same snapshot — two independent reads could interleave a submit or a delete and drift apart.
// It carries the uncapped total too, so neither surface can show a truncated table without saying so
export const readSurveyResponseDatasetSource = async (
  surveyId: Resource["id"],
): Promise<{ columns: DatasetColumn[]; surveyResponses: SurveyResponseEntity[]; totalRows: number }> => {
  // The blob is written on first save, so a freshly created survey serves an empty dataset
  const content = await readResourceContent(ResourceDefinitionMap[ResourceType.Survey].contentSchema, surveyId);
  const columns = getSurveyModelDatasetColumns(parseSurveyModel(content?.model ?? ""));
  const surveyResponses = await readSurveyResponseEntities(surveyId);
  // Counting is a full partition scan, so a read that fit under the cap answers for itself and only a
  // Read that filled it pays for the count — the one case where the caller needs to know what it is missing
  const totalRows =
    surveyResponses.length < AZURE_MAX_PAGE_SIZE ? surveyResponses.length : await countSurveyResponseEntities(surveyId);
  return { columns, surveyResponses, totalRows };
};
