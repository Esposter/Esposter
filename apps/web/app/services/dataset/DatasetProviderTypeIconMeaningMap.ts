import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export const DatasetProviderTypeIconMeaningMap = {
  [DatasetProviderType.ProgramStatus]: UiIconMeaning.Program,
  [DatasetProviderType.Sheet]: UiIconMeaning.Sheet,
  [DatasetProviderType.SurveyResponses]: UiIconMeaning.Survey,
} as const satisfies Record<DatasetProviderType, UiIconMeaning>;
