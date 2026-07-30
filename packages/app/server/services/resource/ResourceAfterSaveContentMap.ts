import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { scheduleTodoReminders } from "@@/server/services/resource/todoList/scheduleTodoReminders";
import { ResourceType } from "@esposter/db-schema";

// The one registry of after-content-write hooks, receiving the prior content for diffing (undefined when the
// Content is written for the first time). Every hook is best-effort and fire-and-forget: it must never fail
// Or delay the write. Registered per type here rather than handed to one procedure factory, because a hook
// Reachable from only one of the paths that write content is a resource whose reminders, schedules or
// Derived state exist or not depending on which door the content came through
export const ResourceAfterSaveContentMap: {
  [TType in ResourceType]?: (
    ctx: AuthedContext,
    resource: Resource,
    content: ResourceContent<TType>,
    previousContent: ResourceContent<TType> | undefined,
  ) => Promise<void>;
} = {
  [ResourceType.TodoList]: (_ctx, resource, content, previousContent) =>
    scheduleTodoReminders(resource.id, content, previousContent),
};
