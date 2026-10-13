import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { ResourceType } from "@esposter/db-schema";

// The provider a resource type serves its dataset through, for the resource types that serve one from their own page
export const DatasetProviderTypeResourceTypeMap: Partial<Record<ResourceType, DatasetProviderType>> = {
  [ResourceType.Program]: DatasetProviderType.ProgramStatus,
  [ResourceType.Survey]: DatasetProviderType.SurveyResponses,
};
