import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
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
    const indexSet = new Set(this.indexedRows.map(({ index }) => index));
    for (const { row } of this.indexedRows)
      for (const column of item.dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    item.dataSource.rows = item.dataSource.rows.filter((_, index) => !indexSet.has(index));
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const ascendingRows = this.indexedRows.toSorted((a, b) => a.index - b.index);
    for (const { row } of ascendingRows)
      for (const column of item.dataSource.columns) column.size += getValueSize(takeOne(row.data, column.name));
    const result: DataSource["rows"] = [];
    let existingIndex = 0;
    for (const { index, row } of ascendingRows) {
      while (result.length < index) {
        result.push(takeOne(item.dataSource.rows, existingIndex));
        existingIndex++;
      }
      result.push(row);
    }
    while (existingIndex < item.dataSource.rows.length) {
      result.push(takeOne(item.dataSource.rows, existingIndex));
      existingIndex++;
    }
    item.dataSource.rows = result;
  }
}
