import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getValueSize } from "@/services/tableEditor/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class CreateRowsCommand extends ADataSourceCommand<CommandType.CreateRows> {
  readonly type = CommandType.CreateRows;

  get description() {
    return `Create ${this.rows.length} Row${this.rows.length === 1 ? "" : "s"}`;
  }

  private readonly rows: DataSource["rows"];
  private readonly startIndex: number;

  constructor(startIndex: number, rows: DataSource["rows"]) {
    super();
    this.startIndex = startIndex;
    this.rows = rows;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    for (const row of this.rows)
      for (const column of item.dataSource.columns) column.size += getValueSize(takeOne(row.data, column.name));
    item.dataSource.rows = [
      ...item.dataSource.rows.slice(0, this.startIndex),
      ...this.rows,
      ...item.dataSource.rows.slice(this.startIndex),
    ];
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    for (const row of this.rows)
      for (const column of item.dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    item.dataSource.rows = [
      ...item.dataSource.rows.slice(0, this.startIndex),
      ...item.dataSource.rows.slice(this.startIndex + this.rows.length),
    ];
  }
}
