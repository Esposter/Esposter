import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getValueSize } from "@/services/tableEditor/file/getValueSize";
import { takeOne } from "@esposter/shared";

export class CreateRowCommand extends ADataSourceCommand<CommandType.CreateRow> {
  readonly type = CommandType.CreateRow;

  get description() {
    return `Create Row ${this.index + 1}`;
  }

  private readonly index: number;
  private readonly newRow: DataSource["rows"][number];

  constructor(index: number, newRow: DataSource["rows"][number]) {
    super();
    this.index = index;
    this.newRow = newRow;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    for (const column of item.dataSource.columns) column.size += getValueSize(takeOne(this.newRow.data, column.name));
    item.dataSource.rows = [
      ...item.dataSource.rows.slice(0, this.index),
      this.newRow,
      ...item.dataSource.rows.slice(this.index),
    ];
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const row = takeOne(item.dataSource.rows, this.index);
    for (const column of item.dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    item.dataSource.rows = item.dataSource.rows.filter((_, i) => i !== this.index);
  }
}
