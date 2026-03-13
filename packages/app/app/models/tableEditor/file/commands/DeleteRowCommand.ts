import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getValueSize } from "@/services/tableEditor/file/getValueSize";
import { takeOne } from "@esposter/shared";

export class DeleteRowCommand extends ADataSourceCommand<CommandType.DeleteRow> {
  readonly type = CommandType.DeleteRow;

  get description() {
    return `Delete row #${this.index + 1}`;
  }

  private readonly index: number;
  private readonly originalRow: DataSource["rows"][number];

  constructor(index: number, originalRow: DataSource["rows"][number]) {
    super();
    this.index = index;
    this.originalRow = originalRow;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const row = takeOne(item.dataSource.rows, this.index);
    for (const column of item.dataSource.columns) column.size -= getValueSize(takeOne(row, column.name));
    item.dataSource.rows = item.dataSource.rows.filter((_, i) => i !== this.index);
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    for (const column of item.dataSource.columns) column.size += getValueSize(takeOne(this.originalRow, column.name));
    item.dataSource.rows = [
      ...item.dataSource.rows.slice(0, this.index),
      this.originalRow,
      ...item.dataSource.rows.slice(this.index),
    ];
  }
}
