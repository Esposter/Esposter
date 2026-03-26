import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getValueSize } from "@/services/tableEditor/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class DeleteRowCommand extends ADataSourceCommand<CommandType.DeleteRow> {
  readonly type = CommandType.DeleteRow;

  get description() {
    return `Delete Row ${this.index + 1}`;
  }

  private readonly index: number;
  private readonly originalRow: DataSource["rows"][number];

  constructor(index: number, originalRow: DataSource["rows"][number]) {
    super();
    this.index = index;
    this.originalRow = originalRow;
  }

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource) return;
    const row = takeOne(item.dataSource.rows, this.index);
    for (const column of item.dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    item.dataSource.rows = item.dataSource.rows.filter((_, i) => i !== this.index);
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource) return;
    for (const column of item.dataSource.columns)
      column.size += getValueSize(takeOne(this.originalRow.data, column.name));
    item.dataSource.rows = [
      ...item.dataSource.rows.slice(0, this.index),
      this.originalRow,
      ...item.dataSource.rows.slice(this.index),
    ];
  }
}
