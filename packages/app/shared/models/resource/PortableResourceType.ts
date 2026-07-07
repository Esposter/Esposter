import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";

export type PortableResourceType = {
  [T in ResourceType]: (typeof ResourceDefinitionMap)[T]["capabilities"] extends { portable: true } ? T : never;
}[ResourceType];
