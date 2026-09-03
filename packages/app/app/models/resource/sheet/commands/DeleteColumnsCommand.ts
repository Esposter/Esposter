import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { IndexedColumn } from "@/models/resource/sheet/commands/IndexedColumn";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { takeOne } from "@esposter/shared";

export class DeleteColumnsCommand extends ADataSourceCommand<CommandType.DeleteColumns> {
  readonly type = CommandType.DeleteColumns;

  get description() {
    return `Delete ${this.#indexedColumns.length} Column${this.#indexedColumns.length === 1 ? "" : "s"}`;
  }

  readonly #indexedColumns: IndexedColumn[];

  constructor(indexedColumns: IndexedColumn[]) {
    super();
    this.#indexedColumns = indexedColumns.toSorted((a, b) => b.columnIndex - a.columnIndex);
  }

  execute(dataSource: DataSource) {
    const namesToDelete = new Set(this.#indexedColumns.map(({ originalColumn }) => originalColumn.name));
    dataSource.columns = dataSource.columns.filter((column) => !namesToDelete.has(column.name));
    for (const { data } of dataSource.rows) for (const name of namesToDelete) delete data[name];
  }

  undo(dataSource: DataSource) {
    const ascendingColumns = this.#indexedColumns.toSorted((a, b) => a.columnIndex - b.columnIndex);
    const restoredColumns: Column[] = [];
    let existingIndex = 0;
    for (const { columnIndex, originalColumn } of ascendingColumns) {
      while (restoredColumns.length < columnIndex) {
        restoredColumns.push(takeOne(dataSource.columns, existingIndex));
        existingIndex++;
      }
      restoredColumns.push(originalColumn);
    }
    while (existingIndex < dataSource.columns.length) {
      restoredColumns.push(takeOne(dataSource.columns, existingIndex));
      existingIndex++;
    }
    dataSource.columns = restoredColumns;
    const restoredColumnNames = restoredColumns.map(({ name }) => name);
    for (const [rowIndex, row] of dataSource.rows.entries()) {
      for (const { originalColumn, originalRowValues } of ascendingColumns)
        row.data[originalColumn.name] = takeOne(originalRowValues, rowIndex);
      const newData: typeof row.data = {};
      for (const name of restoredColumnNames) newData[name] = takeOne(row.data, name);
      row.data = newData;
    }
  }
}
