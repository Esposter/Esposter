import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { DataSourceCommand } from "@/models/tableEditor/file/commands/DataSourceCommand";

import { getValueSize } from "@/services/tableEditor/file/getValueSize";
import { takeOne } from "@esposter/shared";

export const createDeleteRowCommand = (index: number, originalRow: DataSource["rows"][number]): DataSourceCommand => ({
  execute: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource) return;
    const row = takeOne(item.dataSource.rows, index);
    for (const column of item.dataSource.columns) column.size -= getValueSize(takeOne(row, column.name));
    item.dataSource.rows = item.dataSource.rows.filter((_, i) => i !== index);
  },

  undo: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource) return;
    for (const column of item.dataSource.columns) column.size += getValueSize(takeOne(originalRow, column.name));
    item.dataSource.rows = [...item.dataSource.rows.slice(0, index), originalRow, ...item.dataSource.rows.slice(index)];
  },
});
