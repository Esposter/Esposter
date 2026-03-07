import type { AColumn } from "#shared/models/tableEditor/file/AColumn";
import type { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

export const ColumnHeaders: DataTableHeader<AColumn<ColumnType>>[] = [
  { key: "sourceName", title: "Source Field" },
  { key: "name", title: "Field" },
  { key: "type", title: "Type" },
  { key: "actions", sortable: false, title: "Actions" },
];
