import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

// Keyed by the list a dialog was opened on: a duplicated list keeps its todos' ids, so an app-lifetime target would
// Re-open the dialog over the copy's same todos
export const useTodoDialogStore = defineStore("resource/todoList/todoDialog", () => {
  // One todo from its context menu, or every completed one from the Completed heading
  const { data: deletingIds } = useCurrentResourceDataMap<TodoListItem["id"][]>([]);
  return { deletingIds };
});
