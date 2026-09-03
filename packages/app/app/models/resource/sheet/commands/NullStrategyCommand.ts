import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { AffectedCell } from "@/models/resource/sheet/commands/AffectedCell";
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { NullStrategy } from "@/models/resource/sheet/commands/NullStrategy";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
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

  execute(dataSource: DataSource) {
    const columnMap = new Map(dataSource.columns.map((column) => [column.name, column]));
    if (this.#mode === NullStrategy.ReplaceWithNA)
      for (const { columnName, rowIndex } of this.#affectedCells) {
        const row = takeOne(dataSource.rows, rowIndex);
        const column = columnMap.get(columnName);
        if (!column) continue;
        column.size += getValueSize("N/A") - getValueSize(takeOne(row.data, columnName));
        row.data[columnName] = "N/A";
      }
    else {
      for (const { row } of this.#affectedRows)
        for (const [columnName, value] of Object.entries(row.data)) {
          const column = columnMap.get(columnName);
          if (column) column.size -= getValueSize(value);
        }
      dataSource.rows = dataSource.rows.filter(({ id }) => !this.#affectedRows.some(({ row }) => row.id === id));
    }
  }

  undo(dataSource: DataSource) {
    if (this.#mode === NullStrategy.ReplaceWithNA) {
      const columnMap = new Map(dataSource.columns.map((column) => [column.name, column]));
      for (const { columnName, originalValue, rowIndex } of this.#affectedCells) {
        const row = takeOne(dataSource.rows, rowIndex);
        const column = columnMap.get(columnName);
        if (!column) continue;
        column.size += getValueSize(originalValue) - getValueSize(takeOne(row.data, columnName));
        row.data[columnName] = originalValue;
      }
    } else {
      // Reinserted lowest index first, so each row lands at the index it was removed from — the same order
      // The removal recorded them in
      let restoredRows = dataSource.rows;
      for (const { index, row } of this.#affectedRows) restoredRows = restoredRows.toSpliced(index, 0, row);
      dataSource.rows = restoredRows;
      const columnMap = new Map(dataSource.columns.map((column) => [column.name, column]));
      for (const { row } of this.#affectedRows)
        for (const [columnName, value] of Object.entries(row.data)) {
          const column = columnMap.get(columnName);
          if (column) column.size += getValueSize(value);
        }
    }
  }
}
