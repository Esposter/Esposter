import type { Column } from "#shared/models/tableEditor/file/Column";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

export const ColumnHeaders: DataTableHeader<Column>[] = [
  { key: "sourceName", title: "Source Field" },
  { key: "name", title: "Field" },
  { key: "type", title: "Type" },
  { key: "actions", sortable: false, title: "Actions" },
];
