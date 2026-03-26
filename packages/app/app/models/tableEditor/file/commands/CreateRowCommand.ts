import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getValueSize } from "@/services/tableEditor/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class CreateRowCommand extends ADataSourceCommand<CommandType.CreateRow> {
  readonly type = CommandType.CreateRow;

  get description() {
    return `Create Row ${this.index + 1}`;
  }

  private readonly index: number;
  private readonly newRow: Row;

  constructor(index: number, newRow: Row) {
    super();
    this.index = index;
    this.newRow = newRow;
  }

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource) return;
    for (const column of item.dataSource.columns) column.size += getValueSize(takeOne(this.newRow.data, column.name));
    item.dataSource.rows = [
      ...item.dataSource.rows.slice(0, this.index),
      this.newRow,
      ...item.dataSource.rows.slice(this.index),
    ];
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource) return;
    const row = takeOne(item.dataSource.rows, this.index);
    for (const column of item.dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    item.dataSource.rows = item.dataSource.rows.filter((_, i) => i !== this.index);
  }
}
