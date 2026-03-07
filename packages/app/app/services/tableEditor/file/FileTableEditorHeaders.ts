import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { TableEditorHeaders } from "@/services/tableEditor/TableEditorHeaders";

export const FileTableEditorHeaders: DataTableHeader<ADataSourceItem<DataSourceType>>[] = [...TableEditorHeaders];
