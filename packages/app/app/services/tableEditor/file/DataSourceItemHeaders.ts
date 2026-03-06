import type { CsvColumn } from "#shared/models/tableEditor/file/CsvColumn";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { TableEditorHeaders } from "@/services/tableEditor/TableEditorHeaders";

export const DataSourceItemHeaders: DataTableHeader<CsvColumn>[] = [
  ...TableEditorHeaders,
  { key: "sourceName", title: "Source Field" },
  { key: "type", title: "Column Type" },
];
