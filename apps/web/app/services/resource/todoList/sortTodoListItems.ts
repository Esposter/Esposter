import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

import { TodoListSort } from "@/models/resource/todoList/TodoListSort";
import { exhaustiveGuard } from "@esposter/shared";

// A view over the list, never a rewrite of it: every sort is stable, so todos it ranks alike keep the list's own order
export const sortTodoListItems = (items: TodoListItem[], sort: TodoListSort): TodoListItem[] => {
  switch (sort) {
    case TodoListSort.Alphabetical:
      return items.toSorted((firstItem, secondItem) => firstItem.name.localeCompare(secondItem.name));
    case TodoListSort.CreationDate:
      return items.toSorted((firstItem, secondItem) => secondItem.createdAt.getTime() - firstItem.createdAt.getTime());
    // Soonest first, and a todo with no due date after every one that has one. Two undated todos subtract to NaN, which
    // `|| 0` reads as the tie it is
    case TodoListSort.DueDate:
      return items.toSorted(
        (firstItem, secondItem) =>
          (firstItem.dueAt?.getTime() ?? Infinity) - (secondItem.dueAt?.getTime() ?? Infinity) || 0,
      );
    case TodoListSort.Importance:
      return items.toSorted(
        (firstItem, secondItem) => Number(Boolean(secondItem.isImportant)) - Number(Boolean(firstItem.isImportant)),
      );
    case TodoListSort.MyOrder:
      return items;
    default:
      return exhaustiveGuard(sort);
  }
};
