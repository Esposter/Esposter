import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { Column } from "#shared/models/tableEditor/file/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { ToData } from "@esposter/shared";
import type { DataSourceCommand } from "@/models/tableEditor/file/commands/DataSourceCommand";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { dayjs } from "#shared/services/dayjs";
import { getValueSize } from "@/services/tableEditor/file/getValueSize";
import { syncStats } from "@/services/tableEditor/file/syncStats";
import { takeOne } from "@esposter/shared";

export const createUpdateColumnCommand = (
  originalName: string,
  originalColumn: Column | DateColumn,
  updatedColumn: ToData<Column | DateColumn>,
  originalRowValues: ColumnValue[],
): DataSourceCommand => ({
  execute: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource) return;
    const column = item.dataSource.columns.find(({ name }) => name === originalName);
    if (!column) return;
    const newName = updatedColumn.name;
    if (newName !== originalName)
      item.dataSource.rows = item.dataSource.rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key === originalName ? newName : key, value]),
        ),
      );

    if (
      column.type === ColumnType.Date &&
      updatedColumn.type === ColumnType.Date &&
      updatedColumn.format !== column.format
    ) {
      const oldFormat = column.format;
      const newFormat = updatedColumn.format;
      item.dataSource.rows = item.dataSource.rows.map((row) => {
        const value = takeOne(row, newName);
        if (typeof value !== "string") return row;
        const parsedValue = dayjs(value, oldFormat, true);
        if (!parsedValue.isValid()) return row;
        return { ...row, [newName]: parsedValue.format(newFormat) };
      });
      let columnSize = 0;
      for (const row of item.dataSource.rows) columnSize += getValueSize(takeOne(row, newName));
      column.size = columnSize;
    }

    Object.assign(column, updatedColumn);
    syncStats(item.dataSource);
  },

  undo: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource) return;
    const currentName = updatedColumn.name;
    const column = item.dataSource.columns.find(({ name }) => name === currentName);
    if (!column) return;
    if (currentName !== originalName)
      item.dataSource.rows = item.dataSource.rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key === currentName ? originalName : key, value]),
        ),
      );

    for (const [index, row] of item.dataSource.rows.entries()) row[originalName] = takeOne(originalRowValues, index);
    let columnSize = 0;
    for (const value of originalRowValues) columnSize += getValueSize(value);
    column.size = columnSize;
    Object.assign(column, originalColumn);
    syncStats(item.dataSource);
  },
});
