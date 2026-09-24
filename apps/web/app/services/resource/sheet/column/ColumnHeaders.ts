import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

export const ColumnHeaders: UiDataTableColumn<Column>[] = [
  { isSortable: false, key: "drag", title: "" },
  { key: "sourceName", title: "Source Column" },
  { key: "name", title: "Column" },
  { key: "type", title: "Type" },
  { isSortable: false, key: "actions", title: "Actions" },
];
