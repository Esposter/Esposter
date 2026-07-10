import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { AffectedCell } from "@/models/resource/file/commands/AffectedCell";
import type { IndexedRow } from "@/models/resource/file/commands/IndexedRow";

import { ADataSourceCommand } from "@/models/resource/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/file/commands/CommandType";
import { NullStrategy } from "@/models/resource/file/commands/NullStrategy";
import { getValueSize } from "@/services/resource/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class NullStrategyCommand extends ADataSourceCommand<CommandType.NullStrategy> {
  readonly type = CommandType.NullStrategy;

  get description() {
    return `Null Strategy (${this.#mode})`;
  }

  readonly #affectedCells: AffectedCell[];
  readonly #affectedRows: IndexedRow[];
  readonly #mode: NullStrategy;

  constructor(mode: NullStrategy, affectedCells: AffectedCell[], affectedRows: IndexedRow[]) {
    super();
    this.#mode = mode;
    this.#affectedCells = affectedCells;
    this.#affectedRows = affectedRows;
  }

  protected doExecute(dataSource: DataSource) {
    const columnsByNameMap = new Map(dataSource.columns.map((column) => [column.name, column]));
    if (this.#mode === NullStrategy.ReplaceWithNA)
      for (const { columnName, rowIndex } of this.#affectedCells) {
        const row = takeOne(dataSource.rows, rowIndex);
        const column = columnsByNameMap.get(columnName);
        if (!column) continue;
        column.size += getValueSize("N/A") - getValueSize(takeOne(row.data, columnName));
        row.data[columnName] = "N/A";
      }
    else {
      for (const { row } of this.#affectedRows)
        for (const [columnName, value] of Object.entries(row.data)) {
          const column = columnsByNameMap.get(columnName);
          if (column) column.size -= getValueSize(value);
        }
      dataSource.rows = dataSource.rows.filter(({ id }) => !this.#affectedRows.some(({ row }) => row.id === id));
    }
  }

  protected doUndo(dataSource: DataSource) {
    if (this.#mode === NullStrategy.ReplaceWithNA) {
      const columnsByNameMap = new Map(dataSource.columns.map((column) => [column.name, column]));
      for (const { columnName, originalValue, rowIndex } of this.#affectedCells) {
        const row = takeOne(dataSource.rows, rowIndex);
        const column = columnsByNameMap.get(columnName);
        if (!column) continue;
        column.size += getValueSize(originalValue) - getValueSize(takeOne(row.data, columnName));
        row.data[columnName] = originalValue;
      }
    } else {
      for (const { index, row } of this.#affectedRows) dataSource.rows.splice(index, 0, row);
      const columnsByNameMap = new Map(dataSource.columns.map((column) => [column.name, column]));
      for (const { row } of this.#affectedRows)
        for (const [columnName, value] of Object.entries(row.data)) {
          const column = columnsByNameMap.get(columnName);
          if (column) column.size += getValueSize(value);
        }
    }
  }
}
