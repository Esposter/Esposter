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
    for (let rowOffset = 0; rowOffset < this.#pastedValues.length; rowOffset++) {
      const rowIndex = this.#anchorRowIndex + rowOffset;
      const pastedRow = takeOne(this.#pastedValues, rowOffset);
      if (rowIndex < rows.length) {
        const row = takeOne(rows, rowIndex);
        for (
          let columnOffset = 0;
          columnOffset < pastedRow.length && columnOffset < targetNames.length;
          columnOffset++
        ) {
          const columnName = takeOne(targetNames, columnOffset);
          const column = columnsByName.get(columnName);
          if (!column) continue;
          const newValue = coerceValue(takeOne(pastedRow, columnOffset), column.type);
          column.size += getValueSize(newValue) - getValueSize(row.data[columnName]);
          row.data[columnName] = newValue;
        }
      } else {
        const newRow = new Row({ data: Object.fromEntries(columns.map((c) => [c.name, null])) });
        for (
          let columnOffset = 0;
          columnOffset < pastedRow.length && columnOffset < targetNames.length;
          columnOffset++
        ) {
          const columnName = takeOne(targetNames, columnOffset);
          const column = columnsByName.get(columnName);
          if (!column) continue;
          newRow.data[columnName] = coerceValue(takeOne(pastedRow, columnOffset), column.type);
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
    for (let rowOffset = 0; rowOffset < this.#originalRows.length; rowOffset++) {
      const rowIndex = this.#anchorRowIndex + rowOffset;
      const row = takeOne(rows, rowIndex);
      const originalRow = takeOne(this.#originalRows, rowOffset);
      for (const column of columns) {
        const columnValue = takeOne(row.data, column.name);
        const originalColumnValue = takeOne(originalRow.data, column.name);
        column.size += getValueSize(originalColumnValue) - getValueSize(columnValue);
        row.data[column.name] = originalColumnValue;
      }
    }
  }
}
