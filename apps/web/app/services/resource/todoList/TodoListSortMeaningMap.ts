import { TodoListSort } from "#src/models/resource/todoList/TodoListSort";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

export const TodoListSortMeaningMap = {
  [TodoListSort.Alphabetical]: UiIconMeaning.SortAscending,
  [TodoListSort.CreationDate]: UiIconMeaning.New,
  [TodoListSort.DueDate]: UiIconMeaning.Date,
  [TodoListSort.Importance]: UiIconMeaning.Favorite,
  [TodoListSort.MyOrder]: UiIconMeaning.Drag,
} as const satisfies Record<TodoListSort, UiIconMeaning>;
