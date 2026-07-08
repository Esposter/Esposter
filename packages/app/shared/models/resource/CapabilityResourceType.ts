import type { ResourceCapabilities } from "#shared/models/resource/ResourceCapabilities";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";

// The subset of ResourceType whose definition declares the given capability
export type CapabilityResourceType<TCapability extends keyof ResourceCapabilities> = {
  [T in ResourceType]: (typeof ResourceDefinitionMap)[T]["capabilities"] extends Record<TCapability, true> ? T : never;
}[ResourceType];
