import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { coerceValue } from "@/services/resource/sheet/column/coerceValue";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class PasteRangeCommand extends ADataSourceCommand<CommandType.PasteRange> {
  readonly type = CommandType.PasteRange;

  get description() {
    const rowCount = this.#pastedValues.length;
    return `Paste ${rowCount} row${rowCount === 1 ? "" : "s"}`;
  }

  readonly #anchorColumnIndex: number;
  readonly #anchorRowIndex: number;
  // Minted once, so a redo restores the very rows the first execute appended. Newing them per execute hands
  // The grid fresh ids for rows the user never re-created, orphaning selection and every keyed cell on them
  readonly #appendedRows: Row[];
  readonly #originalRows: Row[];
  readonly #pastedValues: string[][];
  readonly #targetColumnNames: string[];

  constructor(
    anchorRowIndex: number,
    anchorColumnIndex: number,
    pastedValues: string[][],
    targetColumnNames: string[],
    originalRows: Row[],
  ) {
    super();
    this.#anchorRowIndex = anchorRowIndex;
    this.#anchorColumnIndex = anchorColumnIndex;
    this.#pastedValues = pastedValues;
    this.#targetColumnNames = targetColumnNames;
    this.#originalRows = originalRows;
    this.#appendedRows = Array.from({ length: pastedValues.length - originalRows.length }, () => new Row());
  }

  execute(dataSource: DataSource) {
    const { columns, rows } = dataSource;
    const targetNames = this.#targetColumnNames.slice(this.#anchorColumnIndex);
    const columnMap = new Map(columns.map((column) => [column.name, column]));
    for (const [rowOffset, pastedRow] of this.#pastedValues.entries()) {
      const rowIndex = this.#anchorRowIndex + rowOffset;
      if (rowIndex < rows.length) {
        const row = takeOne(rows, rowIndex);
        for (const [columnOffset, value] of pastedRow.entries()) {
          if (columnOffset >= targetNames.length) break;
          const columnName = takeOne(targetNames, columnOffset);
          const column = columnMap.get(columnName);
          if (!column) continue;
          const newValue = coerceValue(value, column.type);
          column.size += getValueSize(newValue) - getValueSize(row.data[columnName]);
          row.data[columnName] = newValue;
        }
      } else {
        const appendedRow = takeOne(this.#appendedRows, rowOffset - this.#originalRows.length);
        // Reset rather than fill, so a redo leaves the row holding exactly what the first execute wrote
        appendedRow.data = Object.fromEntries(columns.map(({ name }) => [name, null]));
        for (const [columnOffset, value] of pastedRow.entries()) {
          if (columnOffset >= targetNames.length) break;
          const columnName = takeOne(targetNames, columnOffset);
          const column = columnMap.get(columnName);
          if (!column) continue;
          appendedRow.data[columnName] = coerceValue(value, column.type);
        }
        for (const column of columns) column.size += getValueSize(appendedRow.data[column.name]);
        rows.push(appendedRow);
      }
    }
  }

  undo(dataSource: DataSource) {
    const { columns } = dataSource;
    if (this.#appendedRows.length > 0) {
      const keptCount = dataSource.rows.length - this.#appendedRows.length;
      for (const removedRow of dataSource.rows.slice(keptCount))
        for (const column of columns) column.size -= getValueSize(removedRow.data[column.name]);
      dataSource.rows = dataSource.rows.slice(0, keptCount);
    }
    const { rows } = dataSource;
    for (const [rowOffset, originalRow] of this.#originalRows.entries()) {
      const rowIndex = this.#anchorRowIndex + rowOffset;
      const row = takeOne(rows, rowIndex);
      for (const column of columns) {
        const columnValue = takeOne(row.data, column.name);
        const originalColumnValue = takeOne(originalRow.data, column.name);
        column.size += getValueSize(originalColumnValue) - getValueSize(columnValue);
        row.data[column.name] = originalColumnValue;
      }
    }
  }
}
