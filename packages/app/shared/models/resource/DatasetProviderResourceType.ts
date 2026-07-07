import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";

export type DatasetProviderResourceType = {
  [T in ResourceType]: (typeof ResourceDefinitionMap)[T]["capabilities"] extends { datasetProvider: true } ? T : never;
}[ResourceType];
