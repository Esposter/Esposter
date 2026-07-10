import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { readFileDataset } from "@@/server/services/dataset/file/readFileDataset";
import { readSurveyResponsesDataset } from "@@/server/services/dataset/surveyResponses/readSurveyResponsesDataset";

export const DatasetProviderMap: Record<DatasetProviderType, DatasetProvider> = {
  [DatasetProviderType.File]: readFileDataset,
  [DatasetProviderType.SurveyResponses]: readSurveyResponsesDataset,
};
