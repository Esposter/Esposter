import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { readSurveyResponseDatasetSource } from "@@/server/services/dataset/surveyResponses/readSurveyResponseDatasetSource";
import { toSurveyResponseDatasetRow } from "@@/server/services/dataset/surveyResponses/toSurveyResponseDatasetRow";
import { requireOwnedResource } from "@@/server/services/resource/requireOwnedResource";
import { ResourceType } from "@esposter/db-schema";

export const readSurveyResponsesDataset: DatasetProvider = async (ctx, reference) => {
  const resource = await requireOwnedResource(ctx, reference.id, ResourceType.Survey);

  const { columns, surveyResponses, totalRows } = await readSurveyResponseDatasetSource(resource.id);
  // The dataset contract carries no keys — row identity is the Responses blade's concern, and a
  // Dataset flows into publishable dashboards
  return { columns, rows: surveyResponses.map(({ model }) => toSurveyResponseDatasetRow(columns, model)), totalRows };
};
