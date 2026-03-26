import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getValueSize } from "@/services/tableEditor/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class CreateRowsCommand extends ADataSourceCommand<CommandType.CreateRows> {
  readonly type = CommandType.CreateRows;

  get description() {
    return `Create ${this.rows.length} Row${this.rows.length === 1 ? "" : "s"}`;
  }

  private readonly rows: Row[];
  private readonly startIndex: number;

  constructor(startIndex: number, rows: Row[]) {
    super();
    this.startIndex = startIndex;
    this.rows = rows;
  }

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource) return;
    for (const row of this.rows)
      for (const column of item.dataSource.columns) column.size += getValueSize(takeOne(row.data, column.name));
    item.dataSource.rows = [
      ...item.dataSource.rows.slice(0, this.startIndex),
      ...this.rows,
      ...item.dataSource.rows.slice(this.startIndex),
    ];
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource) return;
    for (const row of this.rows)
      for (const column of item.dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    item.dataSource.rows = [
      ...item.dataSource.rows.slice(0, this.startIndex),
      ...item.dataSource.rows.slice(this.startIndex + this.rows.length),
    ];
  }
}
