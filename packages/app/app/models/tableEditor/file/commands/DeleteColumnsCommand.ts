import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { takeOne } from "@esposter/shared";

interface IndexedColumn {
  columnIndex: number;
  originalColumn: DataSource["columns"][number];
  originalRowValues: ColumnValue[];
}

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

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const namesToDelete = new Set(this.indexedColumns.map(({ originalColumn }) => originalColumn.name));
    item.dataSource.columns = item.dataSource.columns.filter((column) => !namesToDelete.has(column.name));
    for (const row of item.dataSource.rows) for (const name of namesToDelete) delete row.data[name];
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const ascendingColumns = this.indexedColumns.toSorted((a, b) => a.columnIndex - b.columnIndex);
    const result: DataSource["columns"] = [];
    let existingIndex = 0;
    for (const { columnIndex, originalColumn } of ascendingColumns) {
      while (result.length < columnIndex) {
        result.push(takeOne(item.dataSource.columns, existingIndex));
        existingIndex++;
      }
      result.push(originalColumn);
    }
    while (existingIndex < item.dataSource.columns.length) {
      result.push(takeOne(item.dataSource.columns, existingIndex));
      existingIndex++;
    }
    item.dataSource.columns = result;
    for (const [rowIndex, row] of item.dataSource.rows.entries())
      for (const { originalColumn, originalRowValues } of ascendingColumns)
        row.data[originalColumn.name] = takeOne(originalRowValues, rowIndex);
  }
}
