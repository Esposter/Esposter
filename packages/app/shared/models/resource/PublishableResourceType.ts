import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";

export type PublishableResourceType = {
  [T in ResourceType]: (typeof ResourceDefinitionMap)[T]["capabilities"] extends { publishable: true } ? T : never;
}[ResourceType];
