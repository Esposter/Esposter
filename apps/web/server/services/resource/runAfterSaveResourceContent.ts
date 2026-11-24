import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { ResourceInResource } from "@esposter/db-schema";

import { ResourceAfterSaveContentMap } from "#server/services/resource/ResourceAfterSaveContentMap";
import { getSynchronizedFunction } from "@esposter/shared";

// Fires the resource type's registered after-save hook.
// Reached only through `saveResourceContent`, so no path can take that write and skip the hook the type declares.
export const runAfterSaveResourceContent = (
  ctx: AuthedContext,
  resource: ResourceInResource,
  content: unknown,
  previousContent?: unknown,
): void => {
  const afterSaveResourceContent = ResourceAfterSaveContentMap[resource.type];
  if (!afterSaveResourceContent) return;
  // Reached through a runtime resource type, the hook's parameters collapse to the intersection of every content shape.
  // Both contents were parsed by that same type's contentSchema on the way in.
  // So they are pinned back to what the hook declares.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the type's own, parsed by its schema on the way in
  const runHook = afterSaveResourceContent as (
    ctx: AuthedContext,
    resource: ResourceInResource,
    content: unknown,
    previousContent: unknown,
  ) => Promise<void>;
  // Not awaited — a failure costs whatever the hook derives, never the content write it hangs off
  getSynchronizedFunction(runHook)(ctx, resource, content, previousContent);
};
