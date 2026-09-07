import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { ResourceAfterSaveContentMap } from "@@/server/services/resource/ResourceAfterSaveContentMap";

// Fires the resource type's registered after-save hook. Reached only through `saveResourceContent`, so a path
// Cannot take that write and skip the hook the type declares
export const runAfterSaveResourceContent = (
  ctx: AuthedContext,
  resource: Resource,
  content: unknown,
  previousContent?: unknown,
): void => {
  const afterSaveResourceContent = ResourceAfterSaveContentMap[resource.type];
  if (!afterSaveResourceContent) return;
  // Reached through a runtime resource type, so the hook's parameters collapse to the intersection of every
  // Content shape; both contents were parsed by that same type's contentSchema on the way in, so they are pinned
  // Back to what the hook declares
  const runHook = afterSaveResourceContent as (
    ctx: AuthedContext,
    resource: Resource,
    content: unknown,
    previousContent: unknown,
  ) => Promise<void>;
  // Not awaited — a failure costs whatever the hook derives, never the content write it hangs off
  getSynchronizedFunction(runHook)(ctx, resource, content, previousContent);
};
