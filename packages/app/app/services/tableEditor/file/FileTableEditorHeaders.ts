import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { TableEditorHeaders } from "@/services/tableEditor/TableEditorHeaders";

export const FileTableEditorHeaders: DataTableHeader<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>[] = [
  ...TableEditorHeaders,
];
