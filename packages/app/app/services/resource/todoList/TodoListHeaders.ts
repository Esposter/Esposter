import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { dayjs } from "#shared/services/dayjs";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";

export const TodoListHeaders: DataTableHeader<TodoListItem>[] = [
  { key: "type", sortable: false, title: "", width: 0 },
  { key: "name", title: "Name" },
  { isRichText: true, key: "notes", sortable: false, title: "Notes" },
  {
    key: "dueAt",
    title: "Due Date",
    value: (item) => (item.dueAt ? dayjs(item.dueAt).format(RESOURCE_DATE_FORMAT) : null),
  },
];
