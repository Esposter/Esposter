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
    for (const { originalColumn } of this.indexedColumns) {
      item.dataSource.columns = item.dataSource.columns.filter((column) => column.name !== originalColumn.name);
      for (const row of item.dataSource.rows) delete row.data[originalColumn.name];
    }
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const ascendingColumns = this.indexedColumns.toSorted((a, b) => a.columnIndex - b.columnIndex);
    for (const { columnIndex, originalColumn, originalRowValues } of ascendingColumns) {
      item.dataSource.columns = [
        ...item.dataSource.columns.slice(0, columnIndex),
        originalColumn,
        ...item.dataSource.columns.slice(columnIndex),
      ];
      for (const [index, row] of item.dataSource.rows.entries())
        row.data[originalColumn.name] = takeOne(originalRowValues, index);
    }
  }
}
