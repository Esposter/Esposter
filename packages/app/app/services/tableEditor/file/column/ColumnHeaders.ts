import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

export const ColumnHeaders: DataTableHeader<DataSource["columns"][number]>[] = [
  { key: "drag", sortable: false, title: "" },
  { key: "sourceName", title: "Source Column" },
  { key: "name", title: "Column" },
  { key: "type", title: "Type" },
  { key: "actions", sortable: false, title: "Actions" },
];
