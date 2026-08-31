import type { Resource } from "@esposter/db-schema";

import { ResourceLiveContentMap } from "@@/server/services/resource/ResourceLiveContentMap";

// Re-applies a type's live state over content that came out of a snapshot. Every reconstitution goes through
// Here, so a new path cannot be the one that forgets, and a type with nothing live pays a map lookup
export const reapplyLiveResourceContent = async (resource: Resource, content: unknown): Promise<unknown> => {
  const reapplyLiveContent = ResourceLiveContentMap[resource.type];
  if (!reapplyLiveContent) return content;
  // Reached through a runtime resource type, so the parameter collapses to the intersection of every content
  // Shape; the content was parsed by that same type's schema on the way in, so it is pinned back to what the
  // Declaration takes
  const reappliedContent = await (reapplyLiveContent as (resource: Resource, content: unknown) => Promise<unknown>)(
    resource,
    content,
  );
  return reappliedContent;
};
