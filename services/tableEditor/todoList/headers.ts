import type { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import { dayjs } from "@/services/dayjs";
import { tableEditorHeaders } from "@/services/tableEditor/headers";

export const todoListHeaders: DataTableHeader[] = [
  ...tableEditorHeaders,
  { title: "Notes", key: "notes", sortable: false },
  {
    title: "Due Date",
    key: "dueAt",
    value: (item: TodoListItem) => (item.dueAt ? dayjs(item.dueAt).format("ddd, MMM D, YYYY h:mm A") : null),
  },
];
