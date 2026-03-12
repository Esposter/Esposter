import type { Column } from "#shared/models/tableEditor/file/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { ToData } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { dayjs } from "#shared/services/dayjs";
import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { getRecordDifferenceDescription } from "@/services/tableEditor/file/getRecordDifferenceDescription";
import { getValueSize } from "@/services/tableEditor/file/getValueSize";
import { takeOne } from "@esposter/shared";

export class UpdateColumnCommand extends ADataSourceCommand {
  readonly name = "UpdateColumnCommand";

  get description() {
    const recordDifferenceDescription = getRecordDifferenceDescription(this.originalColumn, this.updatedColumn);
    const detail = recordDifferenceDescription ? `\n\n${recordDifferenceDescription}` : "";
    return `Edit Column${detail}`;
  }

  private readonly originalColumn: Column | DateColumn;
  private readonly originalName: string;
  private readonly originalRowValues: ColumnValue[];
  private readonly updatedColumn: ToData<Column | DateColumn>;

  constructor(
    originalName: string,
    originalColumn: Column | DateColumn,
    updatedColumn: ToData<Column | DateColumn>,
    originalRowValues: ColumnValue[],
  ) {
    super();
    this.originalName = originalName;
    this.originalColumn = originalColumn;
    this.updatedColumn = updatedColumn;
    this.originalRowValues = originalRowValues;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const column = item.dataSource.columns.find(({ name }) => name === this.originalName);
    if (!column) return;
    const updatedName = this.updatedColumn.name;
    if (updatedName !== this.originalName)
      item.dataSource.rows = item.dataSource.rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key === this.originalName ? updatedName : key, value]),
        ),
      );

    if (
      column.type === ColumnType.Date &&
      this.updatedColumn.type === ColumnType.Date &&
      this.updatedColumn.format !== column.format
    ) {
      const oldFormat = column.format;
      const newFormat = this.updatedColumn.format;
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

    Object.assign(column, this.updatedColumn);
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const updatedName = this.updatedColumn.name;
    const column = item.dataSource.columns.find(({ name }) => name === updatedName);
    if (!column) return;
    if (updatedName !== this.originalName)
      item.dataSource.rows = item.dataSource.rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key === updatedName ? this.originalName : key, value]),
        ),
      );

    for (const [index, row] of item.dataSource.rows.entries())
      row[this.originalName] = takeOne(this.originalRowValues, index);
    column.size = this.originalRowValues.reduce<number>((total, value) => total + getValueSize(value), 0);
    Object.assign(column, this.originalColumn);
  }
}
