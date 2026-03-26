import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { ToData } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { dayjs } from "#shared/services/dayjs";
import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";
import { getRecordDifferenceDescription } from "@/services/tableEditor/file/commands/getRecordDifferenceDescription";
import { getValueSize } from "@/services/tableEditor/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class UpdateColumnCommand extends ADataSourceCommand<CommandType.UpdateColumn> {
  readonly type = CommandType.UpdateColumn;

  get description() {
    const recordDifferenceDescription = getRecordDifferenceDescription(this.originalColumn, this.updatedColumn);
    const detail = recordDifferenceDescription ? `\n\n${recordDifferenceDescription}` : "";
    return `Edit "${this.originalColumn.name}" Column${detail}`;
  }

  private readonly originalColumn: Column;
  private readonly originalName: string;
  private readonly originalRowValues: ColumnValue[];
  private readonly updatedColumn: ToData<Column>;

  constructor(
    originalName: string,
    originalColumn: Column,
    updatedColumn: ToData<Column>,
    originalRowValues: ColumnValue[],
  ) {
    super();
    this.originalName = originalName;
    this.originalColumn = originalColumn;
    this.updatedColumn = updatedColumn;
    this.originalRowValues = originalRowValues;
  }

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource) return;
    const column = item.dataSource.columns.find(({ name }) => name === this.originalName);
    if (!column) return;
    const updatedName = this.updatedColumn.name;
    if (updatedName !== this.originalName) {
      const newColumnNames = item.dataSource.columns.map(({ name }) =>
        name === this.originalName ? updatedName : name,
      );
      for (const row of item.dataSource.rows) {
        const newData: typeof row.data = {};
        for (const name of newColumnNames)
          newData[name] = name === updatedName ? takeOne(row.data, this.originalName) : takeOne(row.data, name);
        row.data = newData;
      }
    }

    const originalType = column.type;
    const dateFormatChange =
      column.type === ColumnType.Date && this.updatedColumn.type === ColumnType.Date
        ? { newFormat: this.updatedColumn.format, oldFormat: column.format }
        : null;
    Object.assign(column, this.updatedColumn);
    if (dateFormatChange !== null && dateFormatChange.oldFormat !== dateFormatChange.newFormat) {
      const { newFormat, oldFormat } = dateFormatChange;
      let size = 0;
      for (const row of item.dataSource.rows) {
        const value = takeOne(row.data, updatedName);
        if (typeof value === "string") {
          const parsedValue = dayjs(value, oldFormat, true);
          if (parsedValue.isValid()) {
            const newValue = parsedValue.format(newFormat);
            row.data[updatedName] = newValue;
            size += getValueSize(newValue);
            continue;
          }
        }
        size += getValueSize(value);
      }
      column.size = size;
    } else if (originalType !== this.updatedColumn.type) {
      let size = 0;
      for (const row of item.dataSource.rows) {
        const value = takeOne(row.data, updatedName);
        const newValue = coerceValue(value === null ? "" : String(value), this.updatedColumn.type);
        row.data[updatedName] = newValue;
        size += getValueSize(newValue);
      }
      column.size = size;
    }
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource) return;
    const updatedName = this.updatedColumn.name;
    const column = item.dataSource.columns.find(({ name }) => name === updatedName);
    if (!column) return;
    const newColumnNames =
      updatedName === this.originalName
        ? null
        : item.dataSource.columns.map(({ name }) => (name === updatedName ? this.originalName : name));
    for (const [index, row] of item.dataSource.rows.entries()) {
      const value = takeOne(this.originalRowValues, index);
      if (newColumnNames) {
        const newData: typeof row.data = {};
        for (const name of newColumnNames) newData[name] = name === this.originalName ? value : takeOne(row.data, name);
        row.data = newData;
      } else row.data[this.originalName] = value;
    }
    Object.assign(column, this.originalColumn);
  }
}
