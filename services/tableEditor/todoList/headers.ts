import { type DataTableHeader } from "@/models/vuetify/DataTableHeader";
import { tableEditorHeaders } from "@/services/tableEditor/headers";
import dayjs from "dayjs";

export const todoListHeaders: DataTableHeader[] = [
  ...tableEditorHeaders,
  { title: "Notes", key: "notes", sortable: false },
  {
    title: "Due Date",
    key: "dueAt",
    value: (item) => (item.dueAt ? dayjs(item.dueAt).format("ddd, MMM D, YYYY h:mm A") : null),
  },
];
