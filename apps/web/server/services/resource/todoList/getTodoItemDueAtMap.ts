import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";
import type { ToData } from "@esposter/shared";

// The due date of each open item, keyed by the item's id: a completed item needs no reminder, so it is left out
export const getTodoItemDueAtMap = (items: ToData<TodoListResource>["items"]) =>
  new Map(items.flatMap(({ completedAt, dueAt, id }) => (!completedAt && dueAt ? [[id, dueAt.getTime()]] : [])));
