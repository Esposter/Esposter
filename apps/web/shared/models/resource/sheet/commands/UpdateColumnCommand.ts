import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ToData } from "@esposter/shared";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ADataSourceCommand } from "#shared/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "#shared/models/resource/sheet/commands/CommandType";
import { checkIsEditableColumnValue } from "#shared/services/resource/sheet/column/checkIsEditableColumnValue";
import { coerceValue } from "#shared/services/resource/sheet/column/coerceValue";
import { ColumnTypeCreateMap } from "#shared/services/resource/sheet/column/ColumnTypeCreateMap";
import { alignRowDataToColumns } from "#shared/services/resource/sheet/commands/alignRowDataToColumns";
import { getOriginalRowValues } from "#shared/services/resource/sheet/commands/getOriginalRowValues";
import { getRecordDifferenceDescription } from "#shared/services/resource/sheet/commands/getRecordDifferenceDescription";
import { getValueSize } from "#shared/services/resource/sheet/commands/getValueSize";
import { formatDate } from "#shared/util/date/formatDate";
import { parseDate } from "#shared/util/date/parseDate";
import { takeOne, toRawDeep } from "@esposter/shared";

export class UpdateColumnCommand extends ADataSourceCommand<CommandType.UpdateColumn> {
  readonly type = CommandType.UpdateColumn;

  get description() {
    const recordDifferenceDescription = this.#originalColumn
      ? getRecordDifferenceDescription(this.#originalColumn, this.#updatedColumn)
      : "";
    const detail = recordDifferenceDescription ? `\n\n${recordDifferenceDescription}` : "";
    return `Edit "${this.#originalName}" Column${detail}`;
  }

  // What the column held before this command, recorded from the document on execute, so undo restores what the
  // Document held rather than what the caller saw. Undefined until the command has executed
  #originalColumn?: ToData<Column>;
  readonly #originalName: string;
  #originalRowValues: ColumnValue[] = [];
  readonly #updatedColumn: ToData<Column>;

  constructor(originalName: string, updatedColumn: ToData<Column>) {
    super();
    this.#originalName = originalName;
    this.#updatedColumn = updatedColumn;
  }

  execute(dataSource: ToData<DataSource>) {
    const originalName = this.#originalName;
    const columnIndex = dataSource.columns.findIndex(({ name }) => name === originalName);
    if (columnIndex === -1) return;
    const column = takeOne(dataSource.columns, columnIndex);
    this.#originalColumn = structuredClone(toRawDeep(column));
    this.#originalRowValues = getOriginalRowValues(dataSource, originalName);
    const updatedName = this.#updatedColumn.name;
    const originalType = column.type;
    const dateFormatChange =
      column.type === ColumnType.Date && this.#updatedColumn.type === ColumnType.Date
        ? { newFormat: this.#updatedColumn.format, oldFormat: column.format }
        : undefined;
    const newColumn = ColumnTypeCreateMap[this.#updatedColumn.type].create();
    Object.assign(newColumn, this.#updatedColumn);
    dataSource.columns[columnIndex] = newColumn;
    if (updatedName !== originalName)
      for (const row of dataSource.rows) row.data[updatedName] = takeOne(row.data, originalName);

    if (dateFormatChange && dateFormatChange.oldFormat !== dateFormatChange.newFormat) {
      const { newFormat, oldFormat } = dateFormatChange;
      let size = 0;
      for (const row of dataSource.rows) {
        const value = takeOne(row.data, updatedName);
        if (typeof value === "string") {
          const parsedValue = parseDate(value, oldFormat);
          if (parsedValue) {
            const newValue = formatDate(parsedValue, newFormat);
            row.data[updatedName] = newValue;
            size += getValueSize(newValue);
            continue;
          }
        }
        size += getValueSize(value);
      }
      newColumn.size = size;
    }
    // A computed column stores nothing, so a column turned into one keeps no values — the rebuild below drops its key
    else if (this.#updatedColumn.type === ColumnType.Computed) newColumn.size = 0;
    else if (originalType !== this.#updatedColumn.type) {
      let size = 0;
      for (const row of dataSource.rows) {
        // Absent rather than null when the column was computed, which stored nothing to recast
        const value: ColumnValue | undefined = takeOne(row.data, updatedName);
        const newValue = coerceValue(
          value === null || value === undefined ? "" : String(value),
          this.#updatedColumn.type,
        );
        row.data[updatedName] = newValue;
        size += getValueSize(newValue);
      }
      newColumn.size = size;
    }

    if (updatedName !== originalName || originalType !== this.#updatedColumn.type) alignRowDataToColumns(dataSource);
  }

  undo(dataSource: ToData<DataSource>) {
    const originalColumn = this.#originalColumn;
    if (originalColumn === undefined) return;
    const originalName = originalColumn.name;
    const updatedName = this.#updatedColumn.name;
    const columnIndex = dataSource.columns.findIndex(({ name }) => name === updatedName);
    if (columnIndex === -1) return;
    const restoredColumn = ColumnTypeCreateMap[originalColumn.type].create();
    Object.assign(restoredColumn, originalColumn);
    const updatedType = takeOne(dataSource.columns, columnIndex).type;
    dataSource.columns[columnIndex] = restoredColumn;
    // A computed column had nothing stored to put back
    if (checkIsEditableColumnValue(restoredColumn))
      for (const [index, row] of dataSource.rows.entries())
        row.data[originalName] = takeOne(this.#originalRowValues, index);
    if (updatedName !== originalName || updatedType !== restoredColumn.type) alignRowDataToColumns(dataSource);
  }
}
