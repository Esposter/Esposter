import type { CapabilityResourceType } from "#shared/models/resource/CapabilityResourceType";
import type { ResourceCapabilities } from "#shared/models/resource/ResourceCapabilities";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceType } from "@esposter/db-schema";
// One generic guard for every capability — narrows ResourceType to the subset declaring the capability
export const hasCapability = <TCapability extends keyof ResourceCapabilities>(
  type: ResourceType,
  capability: TCapability,
): type is CapabilityResourceType<TCapability> => {
  // Widen off the as-const literal union so the optional capability key is accessible
  const capabilities: ResourceCapabilities = ResourceDefinitionMap[type].capabilities;
  return Boolean(capabilities[capability]);
};
