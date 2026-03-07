import type { AColumn } from "#shared/models/tableEditor/file/AColumn";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

export const ColumnHeaders: DataTableHeader<AColumn>[] = [
  { key: "sourceName", title: "Source Field" },
  { key: "name", title: "Field" },
  { key: "type", title: "Type" },
  { key: "actions", sortable: false, title: "Actions" },
];
