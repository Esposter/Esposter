import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";

// The router that owns each provider type's resources, which is where its sources are listed from
export const DatasetProviderTypeSourceRouterMap = {
  [DatasetProviderType.ProgramStatus]: "program",
  [DatasetProviderType.Sheet]: "sheet",
  [DatasetProviderType.SurveyResponses]: "survey",
} as const satisfies Record<DatasetProviderType, "program" | "sheet" | "survey">;
