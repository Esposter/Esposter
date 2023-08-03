import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import { tableEditorHeaders } from "@/services/tableEditor/headers";

export const todoListHeaders: DataTableHeader[] = [
  ...tableEditorHeaders,
  { title: "Notes", key: "notes", sortable: false },
];
