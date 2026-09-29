import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { TodoListItemOrigin } from "#shared/models/resource/todoList/TodoListItemOrigin";
import type { ToData } from "@esposter/shared";

// A todo a session wrote, with the origin that makes it one
export interface FollowUp extends ToData<TodoListItem> {
  origin: TodoListItemOrigin;
}
