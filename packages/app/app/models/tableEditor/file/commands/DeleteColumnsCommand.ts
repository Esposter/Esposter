import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { IndexedColumn } from "@/models/tableEditor/file/commands/IndexedColumn";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { takeOne } from "@esposter/shared";

export class DeleteColumnsCommand extends ADataSourceCommand<CommandType.DeleteColumns> {
  readonly type = CommandType.DeleteColumns;

  get description() {
    return `Delete ${this.indexedColumns.length} Column${this.indexedColumns.length === 1 ? "" : "s"}`;
  }

  private readonly indexedColumns: IndexedColumn[];

  constructor(indexedColumns: IndexedColumn[]) {
    super();
    this.indexedColumns = indexedColumns.toSorted((a, b) => b.columnIndex - a.columnIndex);
  }

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource) return;
    const namesToDelete = new Set(this.indexedColumns.map(({ originalColumn }) => originalColumn.name));
    const ordersToDelete = new Set(this.indexedColumns.map(({ originalColumn }) => originalColumn.order));
    item.dataSource.columns = item.dataSource.columns.filter((column) => !namesToDelete.has(column.name));
    for (const column of item.dataSource.columns) {
      const deletedBelow = [...ordersToDelete].filter((order) => order < column.order).length;
      column.order -= deletedBelow;
    }
    for (const row of item.dataSource.rows) for (const name of namesToDelete) delete row.data[name];
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource) return;
    const ascendingColumns = this.indexedColumns.toSorted((a, b) => a.columnIndex - b.columnIndex);
    for (const { columnIndex, originalColumn } of ascendingColumns) {
      for (const column of item.dataSource.columns) if (column.order >= columnIndex) column.order++;
      originalColumn.order = columnIndex;
      item.dataSource.columns.push(originalColumn);
    }
    const sortedColumnNames = item.dataSource.columns.toSorted((a, b) => a.order - b.order).map(({ name }) => name);
    for (const [rowIndex, row] of item.dataSource.rows.entries()) {
      for (const { originalColumn, originalRowValues } of ascendingColumns)
        row.data[originalColumn.name] = takeOne(originalRowValues, rowIndex);
      const newData: typeof row.data = {};
      for (const name of sortedColumnNames) newData[name] = takeOne(row.data, name);
      row.data = newData;
    }
  }
}
