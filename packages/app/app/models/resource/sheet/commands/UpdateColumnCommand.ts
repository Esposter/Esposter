import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ToData } from "@esposter/shared";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { dayjs } from "#shared/services/dayjs";
import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { coerceValue } from "@/services/resource/sheet/column/coerceValue";
import { ColumnTypeCreateMap } from "@/services/resource/sheet/column/ColumnTypeCreateMap";
import { getRecordDifferenceDescription } from "@/services/resource/sheet/commands/getRecordDifferenceDescription";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class UpdateColumnCommand extends ADataSourceCommand<CommandType.UpdateColumn> {
  readonly type = CommandType.UpdateColumn;

  get description() {
    const recordDifferenceDescription = getRecordDifferenceDescription(this.#originalColumn, this.#updatedColumn);
    const detail = recordDifferenceDescription ? `\n\n${recordDifferenceDescription}` : "";
    return `Edit "${this.#originalColumn.name}" Column${detail}`;
  }

  readonly #originalColumn: Column;
  readonly #originalName: string;
  readonly #originalRowValues: ColumnValue[];
  readonly #updatedColumn: ToData<Column>;

  constructor(
    originalName: string,
    originalColumn: Column,
    updatedColumn: ToData<Column>,
    originalRowValues: ColumnValue[],
  ) {
    super();
    this.#originalName = originalName;
    this.#originalColumn = originalColumn;
    this.#updatedColumn = updatedColumn;
    this.#originalRowValues = originalRowValues;
  }

  protected doExecute(dataSource: DataSource) {
    const columnIndex = dataSource.columns.findIndex(({ name }) => name === this.#originalName);
    if (columnIndex === -1) return;
    const column = takeOne(dataSource.columns, columnIndex);
    const updatedName = this.#updatedColumn.name;
    if (updatedName !== this.#originalName) {
      const newColumnNames = dataSource.columns.map(({ name }) => (name === this.#originalName ? updatedName : name));
      for (const row of dataSource.rows) {
        const newData: typeof row.data = {};
        for (const name of newColumnNames)
          newData[name] = name === updatedName ? takeOne(row.data, this.#originalName) : takeOne(row.data, name);
        row.data = newData;
      }
    }

    const originalType = column.type;
    const dateFormatChange =
      column.type === ColumnType.Date && this.#updatedColumn.type === ColumnType.Date
        ? { newFormat: this.#updatedColumn.format, oldFormat: column.format }
        : null;
    const newColumn = ColumnTypeCreateMap[this.#updatedColumn.type].create();
    Object.assign(newColumn, this.#updatedColumn);
    dataSource.columns[columnIndex] = newColumn;
    if (dateFormatChange !== null && dateFormatChange.oldFormat !== dateFormatChange.newFormat) {
      const { newFormat, oldFormat } = dateFormatChange;
      let size = 0;
      for (const row of dataSource.rows) {
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
      newColumn.size = size;
    } else if (originalType !== this.#updatedColumn.type) {
      let size = 0;
      for (const row of dataSource.rows) {
        const value = takeOne(row.data, updatedName);
        const newValue = coerceValue(value === null ? "" : String(value), this.#updatedColumn.type);
        row.data[updatedName] = newValue;
        size += getValueSize(newValue);
      }
      newColumn.size = size;
    }
  }

  protected doUndo(dataSource: DataSource) {
    const updatedName = this.#updatedColumn.name;
    const columnIndex = dataSource.columns.findIndex(({ name }) => name === updatedName);
    if (columnIndex === -1) return;
    const newColumnNames =
      updatedName === this.#originalName
        ? null
        : dataSource.columns.map(({ name }) => (name === updatedName ? this.#originalName : name));
    for (const [index, row] of dataSource.rows.entries()) {
      const value = takeOne(this.#originalRowValues, index);
      if (newColumnNames) {
        const newData: typeof row.data = {};
        for (const name of newColumnNames)
          newData[name] = name === this.#originalName ? value : takeOne(row.data, name);
        row.data = newData;
      } else row.data[this.#originalName] = value;
    }
    const restoredColumn = ColumnTypeCreateMap[this.#originalColumn.type].create();
    Object.assign(restoredColumn, this.#originalColumn);
    dataSource.columns[columnIndex] = restoredColumn;
  }
}
