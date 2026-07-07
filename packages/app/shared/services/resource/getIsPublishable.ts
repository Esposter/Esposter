import type { ResourceCapabilities } from "#shared/models/resource/ResourceCapabilities";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceType } from "@esposter/db-schema";

export const getIsPublishable = (type: ResourceType) => {
  // Widen off the as-const literal union so the optional publishable key is accessible
  const capabilities: ResourceCapabilities = ResourceDefinitionMap[type].capabilities;
  return Boolean(capabilities.publishable);
};
