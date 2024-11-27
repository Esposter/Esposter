import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import type { TodoListItem } from "@/shared/models/tableEditor/todoList/TodoListItem";

import { tableEditorHeaders } from "@/services/tableEditor/headers";
import { dayjs } from "@/shared/services/dayjs";

export const todoListHeaders: DataTableHeader[] = [
  ...tableEditorHeaders,
  { isRichText: true, key: "notes", sortable: false, title: "Notes" },
  {
    key: "dueAt",
    title: "Due Date",
    value: (item: TodoListItem) => (item.dueAt ? dayjs(item.dueAt).format("ddd, MMM D, YYYY h:mm A") : null),
  },
];
