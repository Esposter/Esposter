import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { TableEditorHeaders } from "@/services/tableEditor/TableEditorHeaders";

export const FileTableEditorHeaders: DataTableHeader<DataSourceItem>[] = [...TableEditorHeaders];
