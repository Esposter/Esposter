import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { ResourceAfterSaveContentMap } from "@@/server/services/resource/ResourceAfterSaveContentMap";

// Fires the resource type's registered after-save hook. Every path that writes a resource's content calls
// This, so none of them can ship without the hook the type declares
export const runAfterSaveResourceContent = (
  ctx: AuthedContext,
  resource: Resource,
  content: unknown,
  previousContent?: unknown,
): void => {
  const afterSaveResourceContent = ResourceAfterSaveContentMap[resource.type];
  if (!afterSaveResourceContent) return;

  // The hook is reached through a runtime resource type, so its parameters collapse to the intersection of
  // Every content shape; both contents were parsed by that same type's contentSchema on the way in, so they
  // Are pinned back to what the hook declares
  const runHook = afterSaveResourceContent as (
    ctx: AuthedContext,
    resource: Resource,
    content: unknown,
    previousContent: unknown,
  ) => Promise<void>;
  // Fire-and-forget: the hook is best-effort and the write must never wait on it or fail because of it
  getSynchronizedFunction(runHook)(ctx, resource, content, previousContent);
};
