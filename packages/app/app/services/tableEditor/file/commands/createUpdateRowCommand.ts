import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { DataSourceCommand } from "@/models/tableEditor/file/commands/DataSourceCommand";

import { getValueSize } from "@/services/tableEditor/file/getValueSize";
import { takeOne } from "@esposter/shared";

export const createUpdateRowCommand = (
  index: number,
  originalRow: DataSource["rows"][number],
  updatedRow: DataSource["rows"][number],
): DataSourceCommand => ({
  execute: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource || index === -1) return;
    const row = takeOne(item.dataSource.rows, index);
    for (const column of item.dataSource.columns)
      column.size += getValueSize(takeOne(updatedRow, column.name)) - getValueSize(takeOne(row, column.name));
    Object.assign(row, updatedRow);
  },

  undo: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource || index === -1) return;
    const row = takeOne(item.dataSource.rows, index);
    for (const column of item.dataSource.columns)
      column.size += getValueSize(takeOne(originalRow, column.name)) - getValueSize(takeOne(row, column.name));
    Object.assign(row, originalRow);
  },
});
