import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

// Completed todos the newest completion first, whatever the viewer's sort, as the list and its print both show them
export const sortCompletedTodoListItems = (items: TodoListItem[]): TodoListItem[] =>
  items.toSorted(
    (firstItem, secondItem) => (secondItem.completedAt?.getTime() ?? 0) - (firstItem.completedAt?.getTime() ?? 0),
  );
