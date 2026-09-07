import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { formatDate } from "#shared/util/date/formatDate";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";

export const TodoListHeaders: DataTableHeader<TodoListItem>[] = [
  { key: "type", sortable: false, title: "", width: 0 },
  { key: "name", title: "Name" },
  { isRichText: true, key: "notes", sortable: false, title: "Notes" },
  {
    key: "dueAt",
    title: "Due Date",
    value: (item) => (item.dueAt ? formatDate(item.dueAt, RESOURCE_DATE_FORMAT) : null),
  },
];
