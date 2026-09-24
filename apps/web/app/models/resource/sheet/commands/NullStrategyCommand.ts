import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { AffectedCell } from "@/models/resource/sheet/commands/AffectedCell";
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { NullStrategy } from "@/models/resource/sheet/commands/NullStrategy";
import { NULL_STRATEGY_NA_VALUE } from "@/services/resource/sheet/commands/constants";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
import { writeAffectedCells } from "@/services/resource/sheet/commands/writeAffectedCells";

export class NullStrategyCommand extends ADataSourceCommand<CommandType.NullStrategy> {
  readonly type = CommandType.NullStrategy;

  get description() {
    return `Null Strategy (${this.#nullStrategy})`;
  }

  readonly #affectedCells: AffectedCell[];
  readonly #affectedRows: IndexedRow[];
  readonly #nullStrategy: NullStrategy;

  constructor(nullStrategy: NullStrategy, affectedCells: AffectedCell[], affectedRows: IndexedRow[]) {
    super();
    this.#nullStrategy = nullStrategy;
    this.#affectedCells = affectedCells;
    this.#affectedRows = affectedRows;
  }

  execute(dataSource: DataSource) {
    if (this.#nullStrategy === NullStrategy.ReplaceWithNA)
      writeAffectedCells(dataSource, this.#affectedCells, () => NULL_STRATEGY_NA_VALUE);
    else {
      this.#shiftAffectedRowSizes(dataSource, -1);
      dataSource.rows = dataSource.rows.filter(({ id }) => !this.#affectedRows.some(({ row }) => row.id === id));
    }
  }

  undo(dataSource: DataSource) {
    if (this.#nullStrategy === NullStrategy.ReplaceWithNA)
      writeAffectedCells(dataSource, this.#affectedCells, ({ originalValue }) => originalValue);
    else {
      // Reinserted lowest index first, so each row lands at the index it was removed from — the same order
      // The removal recorded them in
      let restoredRows = dataSource.rows;
      for (const { index, row } of this.#affectedRows) restoredRows = restoredRows.toSpliced(index, 0, row);
      dataSource.rows = restoredRows;
      this.#shiftAffectedRowSizes(dataSource, 1);
    }
  }
  // The dropped rows leave their columns' sizes on execute and rejoin them on undo, one walk either way
  #shiftAffectedRowSizes(dataSource: DataSource, sign: -1 | 1) {
    const columnMap = new Map(dataSource.columns.map((column) => [column.name, column]));
    for (const { row } of this.#affectedRows)
      for (const [columnName, value] of Object.entries(row.data)) {
        const column = columnMap.get(columnName);
        if (column) column.size += sign * getValueSize(value);
      }
  }
}
