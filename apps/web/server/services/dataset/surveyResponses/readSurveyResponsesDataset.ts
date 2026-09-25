import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { readSurveyResponseDatasetSource } from "@@/server/services/dataset/surveyResponses/readSurveyResponseDatasetSource";
import { toSurveyResponseDatasetRow } from "@@/server/services/dataset/surveyResponses/toSurveyResponseDatasetRow";

export const readSurveyResponsesDataset: DatasetProvider["read"] = async ({ id }) => {
  const { columns, surveyResponses, totalRows } = await readSurveyResponseDatasetSource(id);
  // The dataset contract carries no keys — row identity is the Responses blade's concern, and a
  // Dataset flows into publishable dashboards
  return { columns, rows: surveyResponses.map(({ model }) => toSurveyResponseDatasetRow(columns, model)), totalRows };
};
