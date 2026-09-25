import type { DatasetProvider } from "@@/server/models/dataset/DatasetProvider";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { readProgramStatusDataset } from "@@/server/services/dataset/programStatus/readProgramStatusDataset";
import { readSheetDataset } from "@@/server/services/dataset/sheet/readSheetDataset";
import { readSurveyResponsesDataset } from "@@/server/services/dataset/surveyResponses/readSurveyResponsesDataset";
import { ResourceType } from "@esposter/db-schema";

export const DatasetProviderMap: Record<DatasetProviderType, DatasetProvider> = {
  [DatasetProviderType.ProgramStatus]: { read: readProgramStatusDataset, resourceType: ResourceType.Program },
  [DatasetProviderType.Sheet]: { read: readSheetDataset, resourceType: ResourceType.Sheet },
  [DatasetProviderType.SurveyResponses]: { read: readSurveyResponsesDataset, resourceType: ResourceType.Survey },
};
