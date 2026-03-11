import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { Column } from "#shared/models/tableEditor/file/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { DataSourceCommand } from "@/models/tableEditor/file/commands/DataSourceCommand";

import { syncStats } from "@/services/tableEditor/file/syncStats";
import { takeOne } from "@esposter/shared";

export const createDeleteColumnCommand = (
  columnIndex: number,
  column: Column | DateColumn,
  rowValues: ColumnValue[],
): DataSourceCommand => ({
  execute: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource) return;
    item.dataSource.columns = item.dataSource.columns.filter((col) => col.name !== column.name);
    item.dataSource.rows = item.dataSource.rows.map((row) =>
      Object.fromEntries(Object.entries(row).filter(([key]) => key !== column.name)),
    );
    syncStats(item.dataSource);
  },

  undo: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource) return;
    item.dataSource.columns = [
      ...item.dataSource.columns.slice(0, columnIndex),
      column,
      ...item.dataSource.columns.slice(columnIndex),
    ];
    for (const [index, row] of item.dataSource.rows.entries()) row[column.name] = takeOne(rowValues, index);
    syncStats(item.dataSource);
  },
});
