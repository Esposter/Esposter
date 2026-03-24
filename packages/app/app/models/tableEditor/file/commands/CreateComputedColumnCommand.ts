import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

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

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    item.dataSource.columns = [
      ...item.dataSource.columns.slice(0, this.columnIndex),
      this.newColumn,
      ...item.dataSource.columns.slice(this.columnIndex),
    ];
    // No row.data writes — computed values are never stored
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    item.dataSource.columns = item.dataSource.columns.filter((column) => column.id !== this.newColumn.id);
  }
}
