import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { ResourceInResource } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

import { updateResourceContent } from "#server/services/resource/updateResourceContent";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceType } from "@esposter/db-schema";

// The list parsed with its type's schema, or empty if it was never saved, handed to `update` to change in place
export const updateTodoListContent = async <T>(
  ctx: AuthedContext,
  resource: ResourceInResource,
  update: (todoList: ToData<TodoListResource>) => T,
): Promise<T> => {
  const { result } = await updateResourceContent(ctx, resource, (storedContent) => {
    const todoList =
      storedContent === null
        ? { items: [] }
        : ResourceDefinitionMap[ResourceType.TodoList].contentSchema.parse(storedContent);
    return { content: todoList, result: update(todoList) };
  });
  return result;
};
