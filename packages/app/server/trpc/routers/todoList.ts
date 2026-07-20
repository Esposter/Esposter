import { scheduleTodoReminders } from "@@/server/services/resource/todoList/scheduleTodoReminders";
import { router } from "@@/server/trpc";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { ResourceType } from "@esposter/db-schema";

export const todoListRouter = router(
  createResourceProcedures(ResourceType.TodoList, {
    afterSaveResourceContent: (_ctx, resource, content, previousContent) =>
      scheduleTodoReminders(resource.id, content, previousContent),
  }),
);
