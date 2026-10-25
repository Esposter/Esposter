import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { IndexedColumn } from "#shared/models/resource/sheet/commands/IndexedColumn";

import { ADataSourceCommand } from "#shared/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "#shared/models/resource/sheet/commands/CommandType";
import { alignRowDataToColumns } from "#shared/services/resource/sheet/commands/alignRowDataToColumns";
import { restoreAtIndices } from "#shared/services/resource/sheet/commands/restoreAtIndices";
import { pluralize } from "#shared/util/text/pluralize";
import { takeOne, toRawDeep } from "@esposter/shared";

export class DeleteColumnsCommand extends ADataSourceCommand<CommandType.DeleteColumns> {
  readonly type = CommandType.DeleteColumns;

  get description() {
    return `Delete ${this.#indexedColumns.length} ${pluralize("Column", this.#indexedColumns.length)}`;
  }

  // The target columns recorded from the document on execute, highest index first
  #indexedColumns: IndexedColumn[] = [];
  readonly #columnIds: string[];

  constructor(columnIds: string[]) {
    super();
    this.#columnIds = columnIds;
  }

  execute(dataSource: DataSource) {
    const columnIdIndexMap = new Map(dataSource.columns.map((column, index) => [column.id, index]));
    const indexedColumns: IndexedColumn[] = [];
    for (const id of this.#columnIds) {
      const columnIndex = columnIdIndexMap.get(id);
      if (columnIndex === undefined) continue;
      const originalColumn = structuredClone(toRawDeep(takeOne(dataSource.columns, columnIndex)));
      indexedColumns.push({ columnIndex, originalColumn, originalRowValues: [] });
    }
    // Every target column's values are collected in one pass, so each row is unwrapped once
    for (const row of dataSource.rows) {
      const { data } = toRawDeep(row);
      for (const { originalColumn, originalRowValues } of indexedColumns)
        originalRowValues.push(takeOne(data, originalColumn.name));
    }
    this.#indexedColumns = indexedColumns.toSorted(
      (firstIndexedColumn, secondIndexedColumn) => secondIndexedColumn.columnIndex - firstIndexedColumn.columnIndex,
    );

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
