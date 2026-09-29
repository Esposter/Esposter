import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { ResourceInResource } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

import { STALE_CONTENT_VERSION_ERROR_MESSAGE } from "#shared/services/resource/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { requireOwnedResource } from "@@/server/services/resource/requireOwnedResource";
import { saveResourceContent } from "@@/server/services/resource/saveResourceContent";
import { TODO_LIST_SAVE_MAX_ATTEMPTS } from "@@/server/services/resource/todoList/constants";
import { ResourceActivityType, ResourceType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// Reads the list, hands it to `update` to change in place and saves it at the version read, so a write from the server
// Never lands over a save it did not see. The owner saving in between makes this save stale, and the list is then read
// Again and the change reapplied to what the owner saved, a bounded number of times, rather than written over
export const updateTodoListContent = async <T>(
  ctx: AuthedContext,
  id: ResourceInResource["id"],
  update: (todoList: ToData<TodoListResource>) => T,
  attempt = 1,
): Promise<T> => {
  const resource = await requireOwnedResource(ctx, id, ResourceType.TodoList);
  const todoList = (await readResourceContent(ResourceDefinitionMap[ResourceType.TodoList].contentSchema, id)) ?? {
    items: [],
  };
  const result = update(todoList);
  const isSaved = await getResultAsync(() =>
    saveResourceContent(ctx, {
      activityType: ResourceActivityType.ContentSaved,
      content: todoList,
      contentVersion: resource.contentVersion,
      resource,
    }),
  ).match(
    () => true,
    (error) => {
      if (attempt < TODO_LIST_SAVE_MAX_ATTEMPTS && error.message === STALE_CONTENT_VERSION_ERROR_MESSAGE) return false;
      throw error;
    },
  );
  return isSaved ? result : updateTodoListContent(ctx, id, update, attempt + 1);
};
