import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { dayjs } from "#shared/services/dayjs";
import { NamedItemHeaders } from "@/services/resource/todoList/NamedItemHeaders";

export const TodoListHeaders: DataTableHeader<TodoListItem>[] = [
  ...NamedItemHeaders,
  { isRichText: true, key: "notes", sortable: false, title: "Notes" },
  {
    key: "dueAt",
    title: "Due Date",
    value: (item) => (item.dueAt ? dayjs(item.dueAt).format("ddd, MMM D, YYYY h:mm A") : null),
  },
];
