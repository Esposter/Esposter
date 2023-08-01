import { tableEditorHeaders } from "@/services/tableEditor/headers";
import type { DataTableHeader } from "@/services/vuetify/dataTable";

export const todoListHeaders: DataTableHeader[] = [
  ...tableEditorHeaders,
  { title: "Notes", key: "notes", sortable: false },
];
