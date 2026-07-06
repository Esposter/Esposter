import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { readSurveyResponsesDataset } from "@@/server/services/dataset/surveyResponses/readSurveyResponsesDataset";
import { readTableDocumentDataset } from "@@/server/services/dataset/tableDocument/readTableDocumentDataset";

export const DatasetProviderMap: Record<DatasetProviderType, DatasetProvider> = {
  [DatasetProviderType.SurveyResponses]: readSurveyResponsesDataset,
  [DatasetProviderType.TableDocument]: readTableDocumentDataset,
};
