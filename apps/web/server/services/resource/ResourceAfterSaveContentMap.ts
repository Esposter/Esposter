import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { scheduleTodoReminders } from "@@/server/services/resource/todoList/scheduleTodoReminders";
import { ResourceType } from "@esposter/db-schema";

// The one registry of after-content-write hooks, receiving the prior content for diffing (undefined when the
// Content is written for the first time). A hook that fails costs whatever it derives, never the write. Held per
// Type here rather than handed to one procedure factory, so no hook is reachable from only some of the paths
// That write content
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
