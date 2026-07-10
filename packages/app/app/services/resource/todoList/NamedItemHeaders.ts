import type { Item } from "#shared/models/entity/NamedItem";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

export const NamedItemHeaders: DataTableHeader<Item>[] = [
  { key: "type", sortable: false, title: "", width: 0 },
  { key: "name", title: "Name" },
];
