import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceType } from "@esposter/db-schema";

const DERIVED_CONTENT_TYPES: ResourceType[] = [ResourceType.Webpage];

// A published webpage holds the html the server baked at publish from its tree, which the working copy never holds: the
// Tree is what Publish renders from. A restore writes a snapshot back into the working copy, so the baked html is left
// Out of it. An email's working copy does hold its compiled html, captured on every save, so a restore keeps it, since
// Nothing re-derives it before the next publish
export const omitDerivedContent = (resource: ResourceInResource, content: unknown): unknown => {
  if (
    !DERIVED_CONTENT_TYPES.some((derivedContentType) => derivedContentType === resource.type) ||
    typeof content !== "object" ||
    content === null
  )
    return content;

  const { html: _html, ...workingContent } = content as { html?: unknown };
  return workingContent;
};
