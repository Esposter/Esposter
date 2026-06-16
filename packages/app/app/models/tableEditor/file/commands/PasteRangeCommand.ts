import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";
import { getValueSize } from "@/services/tableEditor/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class PasteRangeCommand extends ADataSourceCommand<CommandType.PasteRange> {
  readonly type = CommandType.PasteRange;

  get description() {
    const rowCount = this.#pastedValues.length;
    return `Paste ${rowCount} row${rowCount === 1 ? "" : "s"}`;
  }

  readonly #anchorColumnIndex: number;
  readonly #anchorRowIndex: number;
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
  }

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource) return;
    const { columns, rows } = item.dataSource;
    const targetNames = this.#targetColumnNames.slice(this.#anchorColumnIndex);
    const columnsByName = new Map(columns.map((column) => [column.name, column]));
    for (const [rowOffset, pastedRow] of this.#pastedValues.entries()) {
      const rowIndex = this.#anchorRowIndex + rowOffset;
      if (rowIndex < rows.length) {
        const row = takeOne(rows, rowIndex);
        for (const [columnOffset, value] of pastedRow.entries()) {
          if (columnOffset >= targetNames.length) break;
          const columnName = takeOne(targetNames, columnOffset);
          const column = columnsByName.get(columnName);
          if (!column) continue;
          const newValue = coerceValue(value, column.type);
          column.size += getValueSize(newValue) - getValueSize(row.data[columnName]);
          row.data[columnName] = newValue;
        }
      } else {
        const newRow = new Row({ data: Object.fromEntries(columns.map((c) => [c.name, null])) });
        for (const [columnOffset, value] of pastedRow.entries()) {
          if (columnOffset >= targetNames.length) break;
          const columnName = takeOne(targetNames, columnOffset);
          const column = columnsByName.get(columnName);
          if (!column) continue;
          newRow.data[columnName] = coerceValue(value, column.type);
        }
        for (const column of columns) column.size += getValueSize(newRow.data[column.name]);
        rows.push(newRow);
      }
    }
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource) return;
    const { columns, rows } = item.dataSource;
    const appendedRowCount = this.#pastedValues.length - this.#originalRows.length;
    if (appendedRowCount > 0) {
      const removedRows = rows.splice(rows.length - appendedRowCount, appendedRowCount);
      for (const removedRow of removedRows)
        for (const column of columns) column.size -= getValueSize(removedRow.data[column.name]);
    }
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
