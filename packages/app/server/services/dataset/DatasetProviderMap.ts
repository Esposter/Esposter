import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { readSheetDataset } from "@@/server/services/dataset/sheet/readSheetDataset";
import { readSurveyResponsesDataset } from "@@/server/services/dataset/surveyResponses/readSurveyResponsesDataset";

export const DatasetProviderMap: Record<DatasetProviderType, DatasetProvider> = {
  [DatasetProviderType.Sheet]: readSheetDataset,
  [DatasetProviderType.SurveyResponses]: readSurveyResponsesDataset,
};
