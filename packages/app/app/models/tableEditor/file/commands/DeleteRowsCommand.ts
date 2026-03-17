import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import type { IndexedRow } from "@/models/tableEditor/file/commands/IndexedRow";
import { getValueSize } from "@/services/tableEditor/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class DeleteRowsCommand extends ADataSourceCommand<CommandType.DeleteRows> {
  readonly type = CommandType.DeleteRows;

  get description() {
    return `Delete ${this.indexedRows.length} Row${this.indexedRows.length === 1 ? "" : "s"}`;
  }

  private readonly indexedRows: IndexedRow[];

  constructor(indexedRows: IndexedRow[]) {
    super();
    this.indexedRows = indexedRows.toSorted((a, b) => b.index - a.index);
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    for (const { index, row } of this.indexedRows) {
      for (const column of item.dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
      item.dataSource.rows = item.dataSource.rows.filter((_, i) => i !== index);
    }
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const ascendingRows = this.indexedRows.toSorted((a, b) => a.index - b.index);
    for (const { index, row } of ascendingRows) {
      for (const column of item.dataSource.columns) column.size += getValueSize(takeOne(row.data, column.name));
      item.dataSource.rows = [...item.dataSource.rows.slice(0, index), row, ...item.dataSource.rows.slice(index)];
    }
  }
}
