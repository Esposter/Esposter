import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { formatDate } from "#shared/util/date/formatDate";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";

export const TodoListHeaders: UiDataTableColumn<TodoListItem>[] = [
  { isSortable: false, key: "type", title: "" },
  { key: "name", title: "Name" },
  { isSortable: false, key: "notes", title: "Notes" },
  {
    // Searched as the date reads, sorted by when it falls
    compare: (firstItem, secondItem) => (firstItem.dueAt?.getTime() ?? 0) - (secondItem.dueAt?.getTime() ?? 0),
    getValue: ({ dueAt }) => (dueAt ? formatDate(dueAt, RESOURCE_DATE_FORMAT) : ""),
    key: "dueAt",
    title: "Due date",
  },
];
