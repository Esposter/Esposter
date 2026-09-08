import type { Resource } from "@esposter/db-schema";

import { ResourceLiveContentMap } from "@@/server/services/resource/ResourceLiveContentMap";

// Re-applies a type's live state over content that came out of a snapshot. Every reconstitution goes through
// Here, so a new path cannot be the one that forgets, and a type with nothing live pays a map lookup
export const reapplyLiveResourceContent = (resource: Resource, content: unknown): Promise<unknown> => {
  const reapplyLiveContent = ResourceLiveContentMap[resource.type];
  if (reapplyLiveContent) return reapplyLiveContent(resource, content as never);
  else return Promise.resolve(content);
};
