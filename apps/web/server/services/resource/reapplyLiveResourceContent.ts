import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceInResource, ResourceType } from "@esposter/db-schema";

import { ResourceLiveContentMap } from "#server/services/resource/ResourceLiveContentMap";

// Re-applies a type's live state over content that came out of a snapshot. Every reconstitution goes through
// Here, so a new path cannot be the one that forgets, and a type with nothing live pays a map lookup
export function reapplyLiveResourceContent<TType extends ResourceType>(
  resource: ResourceInResource,
  content: ResourceContent<TType>,
): Promise<ResourceContent<TType>>;
export function reapplyLiveResourceContent(resource: ResourceInResource, content: unknown): Promise<unknown>;
export function reapplyLiveResourceContent(resource: ResourceInResource, content: unknown) {
  const reapplyLiveContent = ResourceLiveContentMap[resource.type];
  if (reapplyLiveContent) return reapplyLiveContent(resource, content as never);
  else return Promise.resolve(content);
}
