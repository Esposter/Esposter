import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getValueSize } from "@/services/tableEditor/file/getValueSize";

export class CreateColumnCommand extends ADataSourceCommand<CommandType.CreateColumn> {
  readonly type = CommandType.CreateColumn;

  get description() {
    return `Create "${this.newColumn.name}" Column`;
  }

  private readonly columnIndex: number;
  private readonly newColumn: DataSource["columns"][number];

  constructor(columnIndex: number, newColumn: DataSource["columns"][number]) {
    super();
    this.columnIndex = columnIndex;
    this.newColumn = newColumn;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    this.newColumn.size = item.dataSource.rows.length * getValueSize(null);
    item.dataSource.columns = [
      ...item.dataSource.columns.slice(0, this.columnIndex),
      this.newColumn,
      ...item.dataSource.columns.slice(this.columnIndex),
    ];
    for (const row of item.dataSource.rows) row.data[this.newColumn.name] = null;
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    item.dataSource.columns = item.dataSource.columns.filter((column) => column.name !== this.newColumn.name);
    for (const row of item.dataSource.rows) delete row.data[this.newColumn.name];
  }
}
