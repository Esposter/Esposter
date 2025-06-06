import type { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { dayjs } from "#shared/services/dayjs";
import { TableEditorHeaders } from "@/services/tableEditor/TableEditorHeaders";

export const TodoListHeaders: DataTableHeader<TodoListItem>[] = [
  ...TableEditorHeaders,
  { isRichText: true, key: "notes", sortable: false, title: "Notes" },
  {
    key: "dueAt",
    title: "Due Date",
    value: (item) => (item.dueAt ? dayjs(item.dueAt).format("ddd, MMM D, YYYY h:mm A") : null),
  },
];
