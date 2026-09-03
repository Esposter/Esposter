import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { AffectedCell } from "@/models/resource/sheet/commands/AffectedCell";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { coerceValue } from "@/services/resource/sheet/column/coerceValue";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class FindReplaceCommand extends ADataSourceCommand<CommandType.FindReplace> {
  readonly type = CommandType.FindReplace;

  get description() {
    const uniqueRowIndices = new Set(this.#affectedCells.map((cell) => cell.rowIndex));
    const location = uniqueRowIndices.size === 1 ? ` on row ${takeOne(this.#affectedCells).rowIndex + 1}` : " (all)";
    return `Find & Replace "${this.#findValue}" → "${this.#replaceValue}"${location}`;
  }

  readonly #affectedCells: AffectedCell[];
  readonly #findValue: string;
  readonly #replaceValue: string;

  constructor(findValue: string, replaceValue: string, affectedCells: AffectedCell[]) {
    super();
    this.#findValue = findValue;
    this.#replaceValue = replaceValue;
    this.#affectedCells = affectedCells;
  }

  execute(dataSource: DataSource) {
    const columnMap = new Map(dataSource.columns.map((column) => [column.name, column]));
    for (const { columnName, originalValue, rowIndex } of this.#affectedCells) {
      const row = takeOne(dataSource.rows, rowIndex);
      const column = columnMap.get(columnName);
      if (!column) continue;
      const replacedString = String(originalValue).replaceAll(this.#findValue, this.#replaceValue);
      const newValue = column.type === ColumnType.String ? replacedString : coerceValue(replacedString, column.type);
      column.size += getValueSize(newValue) - getValueSize(takeOne(row.data, columnName));
      row.data[columnName] = newValue;
    }
  }

  undo(dataSource: DataSource) {
    const columnMap = new Map(dataSource.columns.map((column) => [column.name, column]));
    for (const { columnName, originalValue, rowIndex } of this.#affectedCells) {
      const row = takeOne(dataSource.rows, rowIndex);
      const column = columnMap.get(columnName);
      if (!column) continue;
      column.size += getValueSize(originalValue) - getValueSize(takeOne(row.data, columnName));
      row.data[columnName] = originalValue;
    }
  }
}
