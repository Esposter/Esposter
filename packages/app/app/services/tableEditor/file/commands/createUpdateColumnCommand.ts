import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { Column } from "#shared/models/tableEditor/file/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { DataSourceCommand } from "@/models/tableEditor/file/commands/DataSourceCommand";
import type { ToData } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { dayjs } from "#shared/services/dayjs";
import { getValueSize } from "@/services/tableEditor/file/getValueSize";
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
    const updatedName = updatedColumn.name;
    if (updatedName !== originalName)
      item.dataSource.rows = item.dataSource.rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key === originalName ? updatedName : key, value]),
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
        const value = takeOne(row, updatedName);
        if (typeof value !== "string") return row;
        const parsedValue = dayjs(value, oldFormat, true);
        if (!parsedValue.isValid()) return row;
        return { ...row, [updatedName]: parsedValue.format(newFormat) };
      });
      column.size = item.dataSource.rows.reduce<number>(
        (total, row) => total + getValueSize(takeOne(row, updatedName)),
        0,
      );
    }

    Object.assign(column, updatedColumn);
  },

  undo: (item: ADataSourceItem<DataSourceType>) => {
    if (!item.dataSource) return;
    const updatedName = updatedColumn.name;
    const column = item.dataSource.columns.find(({ name }) => name === updatedName);
    if (!column) return;
    if (updatedName !== originalName)
      item.dataSource.rows = item.dataSource.rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key === updatedName ? originalName : key, value]),
        ),
      );

    for (const [index, row] of item.dataSource.rows.entries()) row[originalName] = takeOne(originalRowValues, index);
    column.size = originalRowValues.reduce<number>((total, value) => total + getValueSize(value), 0);
    Object.assign(column, originalColumn);
  },
});
