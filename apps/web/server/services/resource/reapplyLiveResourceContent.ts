import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceInResource, ResourceType } from "@esposter/db-schema";

import { ResourceLiveContentMap } from "#server/services/resource/ResourceLiveContentMap";

// Re-applies a type's live state over content that came out of a snapshot. Every reconstitution goes through
// Here, so a new path cannot be the one that forgets, and a type with nothing live pays a map lookup. The type keys
// Both the map and the content, so the entry read for it takes that type's own content and nothing is asserted
export const reapplyLiveResourceContent = <TType extends ResourceType>(
  type: TType,
  resource: ResourceInResource,
  content: ResourceContent<TType>,
): Promise<ResourceContent<TType>> => {
  const reapplyLiveContent = ResourceLiveContentMap[type];
  if (reapplyLiveContent) return reapplyLiveContent(resource, content);
  else return Promise.resolve(content);
};
