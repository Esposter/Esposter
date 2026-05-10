import type { Item } from "#shared/models/tableEditor/data/Item";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

export const TableEditorHeaders: DataTableHeader<Item>[] = [
  { key: "type", sortable: false, title: "", width: 0 },
  { key: "name", title: "Name" },
];
