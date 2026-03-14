import type { Column } from "#shared/models/tableEditor/file/Column";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

export const ColumnHeaders: DataTableHeader<Column | DateColumn>[] = [
  { key: "drag", sortable: false, title: "" },
  { key: "sourceName", title: "Source Column" },
  { key: "name", title: "Column" },
  { key: "type", title: "Type" },
  { key: "actions", sortable: false, title: "Actions" },
];
