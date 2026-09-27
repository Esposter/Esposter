import { TodoListSort } from "@/models/resource/todoList/TodoListSort";

export const TodoListSortLabelMap = {
  [TodoListSort.Alphabetical]: "Alphabetically",
  [TodoListSort.CreationDate]: "Creation date",
  [TodoListSort.DueDate]: "Due date",
  [TodoListSort.Importance]: "Importance",
  [TodoListSort.MyOrder]: "My order",
} as const satisfies Record<TodoListSort, string>;
