import type { ResourceCapabilities } from "#shared/models/resource/ResourceCapabilities";
import type { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import type { ResourceType } from "@esposter/db-schema";

// The subset of ResourceType whose definition declares the given capability
export type CapabilityResourceType<TCapability extends keyof ResourceCapabilities> = {
  [T in ResourceType]: (typeof ResourceDefinitionMap)[T]["capabilities"] extends Record<TCapability, true> ? T : never;
}[ResourceType];
