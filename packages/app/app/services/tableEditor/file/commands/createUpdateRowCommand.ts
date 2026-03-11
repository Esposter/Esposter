import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { DataSourceCommand } from "@/models/tableEditor/file/commands/DataSourceCommand";

import { getValueSize } from "@/services/tableEditor/file/getValueSize";
import { syncStats } from "@/services/tableEditor/file/syncStats";
import { takeOne } from "@esposter/shared";

export const createUpdateRowCommand = (
  index: number,
  before: DataSource["rows"][number],
  after: DataSource["rows"][number],
): DataSourceCommand => ({
  execute: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource || index === -1) return;
    const row = takeOne(item.dataSource.rows, index);
    for (const column of item.dataSource.columns)
      column.size += getValueSize(takeOne(after, column.name)) - getValueSize(takeOne(row, column.name));
    Object.assign(row, after);
    syncStats(item.dataSource);
  },

  undo: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource || index === -1) return;
    const row = takeOne(item.dataSource.rows, index);
    for (const column of item.dataSource.columns)
      column.size += getValueSize(takeOne(before, column.name)) - getValueSize(takeOne(row, column.name));
    Object.assign(row, before);
    syncStats(item.dataSource);
  },
});
