import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { IndexedColumn } from "@/models/resource/sheet/commands/IndexedColumn";

import { pluralize } from "#shared/util/text/pluralize";
import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { alignRowDataToColumns } from "@/services/resource/sheet/commands/alignRowDataToColumns";
import { restoreAtIndices } from "@/services/resource/sheet/commands/restoreAtIndices";
import { takeOne } from "@esposter/shared";

export class DeleteColumnsCommand extends ADataSourceCommand<CommandType.DeleteColumns> {
  readonly type = CommandType.DeleteColumns;

  get description() {
    return `Delete ${this.#indexedColumns.length} ${pluralize("Column", this.#indexedColumns.length)}`;
  }

  readonly #indexedColumns: IndexedColumn[];

  constructor(indexedColumns: IndexedColumn[]) {
    super();
    this.#indexedColumns = indexedColumns.toSorted(
      (firstIndexedColumn, secondIndexedColumn) => secondIndexedColumn.columnIndex - firstIndexedColumn.columnIndex,
    );
  }

  execute(dataSource: DataSource) {
    const namesToDelete = new Set(this.#indexedColumns.map(({ originalColumn }) => originalColumn.name));
    dataSource.columns = dataSource.columns.filter((column) => !namesToDelete.has(column.name));
    for (const { data } of dataSource.rows) for (const name of namesToDelete) delete data[name];
  }

  undo(dataSource: DataSource) {
    const ascendingColumns = this.#indexedColumns.toSorted(
      (firstIndexedColumn, secondIndexedColumn) => firstIndexedColumn.columnIndex - secondIndexedColumn.columnIndex,
    );
    dataSource.columns = restoreAtIndices(
      dataSource.columns,
      ascendingColumns.map(({ columnIndex, originalColumn }) => ({ index: columnIndex, item: originalColumn })),
    );
    for (const [rowIndex, row] of dataSource.rows.entries())
      for (const { originalColumn, originalRowValues } of ascendingColumns)
        row.data[originalColumn.name] = takeOne(originalRowValues, rowIndex);
    alignRowDataToColumns(dataSource);
  }
}
