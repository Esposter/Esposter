import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";

export class CreateComputedColumnCommand extends ADataSourceCommand<CommandType.CreateComputedColumn> {
  readonly type = CommandType.CreateComputedColumn;

  get description() {
    return `Create "${this.newColumn.name}" Column`;
  }

  private readonly columnIndex: number;
  private readonly newColumn: ComputedColumn;

  constructor(columnIndex: number, newColumn: ComputedColumn) {
    super();
    this.columnIndex = columnIndex;
    this.newColumn = newColumn;
  }

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource) return;
    this.newColumn.order = this.columnIndex;
    for (const column of item.dataSource.columns) if (column.order >= this.columnIndex) column.order++;
    item.dataSource.columns.push(this.newColumn);
    // No row.data writes — computed values are never stored
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource) return;
    item.dataSource.columns = item.dataSource.columns.filter((column) => column.id !== this.newColumn.id);
    for (const column of item.dataSource.columns) if (column.order > this.columnIndex) column.order--;
  }
}
