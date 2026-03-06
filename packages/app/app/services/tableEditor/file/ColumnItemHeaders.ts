import type { ColumnItem } from "#shared/models/tableEditor/file/ColumnItem";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { TableEditorHeaders } from "@/services/tableEditor/TableEditorHeaders";

export const ColumnItemHeaders: DataTableHeader<ColumnItem>[] = [
  ...TableEditorHeaders,
  { key: "sourceName", title: "Source Field" },
  { key: "dataSourceType", title: "Source Type" },
];
