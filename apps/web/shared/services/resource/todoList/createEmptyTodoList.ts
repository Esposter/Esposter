import type { TodoListResource } from "#shared/models/resource/todoList/TodoListResource";

// The todo list a new one starts from, before its first save
export const createEmptyTodoList = (): TodoListResource => ({ items: [] });
