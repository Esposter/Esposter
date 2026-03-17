import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

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
    for (const [offset, row] of this.rows.entries()) {
      const index = this.startIndex + offset;
      for (const column of item.dataSource.columns) column.size += getValueSize(takeOne(row.data, column.name));
      item.dataSource.rows = [...item.dataSource.rows.slice(0, index), row, ...item.dataSource.rows.slice(index)];
    }
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    for (let offset = this.rows.length - 1; offset >= 0; offset--) {
      const index = this.startIndex + offset;
      const row = takeOne(item.dataSource.rows, index);
      for (const column of item.dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
      item.dataSource.rows = item.dataSource.rows.filter((_, i) => i !== index);
    }
  }
}
