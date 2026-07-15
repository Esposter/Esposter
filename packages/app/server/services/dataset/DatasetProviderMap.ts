import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { readProgramStatusDataset } from "@@/server/services/dataset/programStatus/readProgramStatusDataset";
import { readSheetDataset } from "@@/server/services/dataset/sheet/readSheetDataset";
import { readSurveyResponsesDataset } from "@@/server/services/dataset/surveyResponses/readSurveyResponsesDataset";

export const DatasetProviderMap: Record<DatasetProviderType, DatasetProvider> = {
  [DatasetProviderType.ProgramStatus]: readProgramStatusDataset,
  [DatasetProviderType.Sheet]: readSheetDataset,
  [DatasetProviderType.SurveyResponses]: readSurveyResponsesDataset,
};
