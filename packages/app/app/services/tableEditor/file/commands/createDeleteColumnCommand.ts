import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { Column } from "#shared/models/tableEditor/file/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { DataSourceCommand } from "@/models/tableEditor/file/commands/DataSourceCommand";

import { takeOne } from "@esposter/shared";

export const createDeleteColumnCommand = (
  columnIndex: number,
  originalColumn: Column | DateColumn,
  originalRowValues: ColumnValue[],
): DataSourceCommand => ({
  execute: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource) return;
    item.dataSource.columns = item.dataSource.columns.filter((column) => column.name !== originalColumn.name);
    item.dataSource.rows = item.dataSource.rows.map((row) =>
      Object.fromEntries(Object.entries(row).filter(([key]) => key !== originalColumn.name)),
    );
  },

  undo: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource) return;
    item.dataSource.columns = [
      ...item.dataSource.columns.slice(0, columnIndex),
      originalColumn,
      ...item.dataSource.columns.slice(columnIndex),
    ];
    for (const [index, row] of item.dataSource.rows.entries())
      row[originalColumn.name] = takeOne(originalRowValues, index);
  },
});
