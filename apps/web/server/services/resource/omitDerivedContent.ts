import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceType } from "@esposter/db-schema";

const DERIVED_CONTENT_TYPES = new Set<ResourceType>([ResourceType.Email, ResourceType.Webpage]);

// A published snapshot holds the html its type baked at publish, which the working copy never does: the tree is what
// Publish renders from. A restore writes a snapshot back into the working copy, so the baked html is left out of it
export const omitDerivedContent = (resource: ResourceInResource, content: unknown): unknown => {
  if (!DERIVED_CONTENT_TYPES.has(resource.type) || typeof content !== "object" || content === null) return content;

  const { html: _html, ...workingContent } = content as { html?: unknown };
  return workingContent;
};
