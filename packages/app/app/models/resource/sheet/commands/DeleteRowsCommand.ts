import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class DeleteRowsCommand extends ADataSourceCommand<CommandType.DeleteRows> {
  readonly type = CommandType.DeleteRows;

  get description() {
    return `Delete ${this.#indexedRows.length} Row${this.#indexedRows.length === 1 ? "" : "s"}`;
  }

  readonly #indexedRows: IndexedRow[];

  constructor(indexedRows: IndexedRow[]) {
    super();
    this.#indexedRows = indexedRows.toSorted((a, b) => b.index - a.index);
  }

  execute(dataSource: DataSource) {
    const indexSet = new Set(this.#indexedRows.map(({ index }) => index));
    for (const { row } of this.#indexedRows)
      for (const column of dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    dataSource.rows = dataSource.rows.filter((_, index) => !indexSet.has(index));
  }

  undo(dataSource: DataSource) {
    const ascendingRows = this.#indexedRows.toSorted((a, b) => a.index - b.index);
    for (const { row } of ascendingRows)
      for (const column of dataSource.columns) column.size += getValueSize(takeOne(row.data, column.name));
    const restoredRows: Row[] = [];
    let existingIndex = 0;
    for (const { index, row } of ascendingRows) {
      while (restoredRows.length < index) {
        restoredRows.push(takeOne(dataSource.rows, existingIndex));
        existingIndex++;
      }
      restoredRows.push(row);
    }
    while (existingIndex < dataSource.rows.length) {
      restoredRows.push(takeOne(dataSource.rows, existingIndex));
      existingIndex++;
    }
    dataSource.rows = restoredRows;
  }
}
