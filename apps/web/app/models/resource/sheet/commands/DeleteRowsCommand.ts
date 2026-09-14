import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { pluralize } from "#shared/util/text/pluralize";
import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
import { restoreAtIndices } from "@/services/resource/sheet/commands/restoreAtIndices";
import { takeOne } from "@esposter/shared";

export class DeleteRowsCommand extends ADataSourceCommand<CommandType.DeleteRows> {
  readonly type = CommandType.DeleteRows;

  get description() {
    return `Delete ${this.#indexedRows.length} ${pluralize("Row", this.#indexedRows.length)}`;
  }

  readonly #indexedRows: IndexedRow[];

  constructor(indexedRows: IndexedRow[]) {
    super();
    this.#indexedRows = indexedRows.toSorted(
      (firstIndexedRow, secondIndexedRow) => secondIndexedRow.index - firstIndexedRow.index,
    );
  }

  execute(dataSource: DataSource) {
    const indexSet = new Set(this.#indexedRows.map(({ index }) => index));
    for (const { row } of this.#indexedRows)
      for (const column of dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    dataSource.rows = dataSource.rows.filter((_, index) => !indexSet.has(index));
  }

  undo(dataSource: DataSource) {
    const ascendingRows = this.#indexedRows.toSorted(
      (firstIndexedRow, secondIndexedRow) => firstIndexedRow.index - secondIndexedRow.index,
    );
    for (const { row } of ascendingRows)
      for (const column of dataSource.columns) column.size += getValueSize(takeOne(row.data, column.name));
    dataSource.rows = restoreAtIndices(
      dataSource.rows,
      ascendingRows.map(({ index, row }) => ({ index, item: row })),
    );
  }
}
