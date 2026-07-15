import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { Resource, SurveyResponseEntity } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { parseSurveyModel } from "#shared/services/survey/parseSurveyModel";
import { getSurveyModelDatasetColumns } from "@@/server/services/dataset/surveyResponses/getSurveyModelDatasetColumns";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { readSurveyResponseEntities } from "@@/server/services/survey/readSurveyResponseEntities";
import { ResourceType } from "@esposter/db-schema";

// The one read behind both the dataset and the Responses blade, so a row and its key always come from
// The same snapshot — two independent reads could interleave a submit or a delete and drift apart
export const readSurveyResponseDatasetSource = async (
  surveyId: Resource["id"],
): Promise<{ columns: DatasetColumn[]; surveyResponses: SurveyResponseEntity[] }> => {
  // The blob is written on first save, so a freshly created survey serves an empty dataset
  const content = await readResourceContent(ResourceDefinitionMap[ResourceType.Survey].contentSchema, surveyId);
  const columns = getSurveyModelDatasetColumns(parseSurveyModel(content?.model ?? ""));
  const surveyResponses = await readSurveyResponseEntities(surveyId);
  return { columns, surveyResponses };
};
