import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getValueSize } from "@/services/tableEditor/file/commands/getValueSize";

export class CreateColumnCommand extends ADataSourceCommand<CommandType.CreateColumn> {
  readonly type = CommandType.CreateColumn;

  get description() {
    return `Create "${this.newColumn.name}" Column`;
  }

  private readonly columnIndex: number;
  private readonly newColumn: Column;

  constructor(columnIndex: number, newColumn: Column) {
    super();
    this.columnIndex = columnIndex;
    this.newColumn = newColumn;
  }

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource) return;
    this.newColumn.size = item.dataSource.rows.length * getValueSize(null);
    this.newColumn.order = this.columnIndex;
    for (const column of item.dataSource.columns) if (column.order >= this.columnIndex) column.order++;
    item.dataSource.columns.push(this.newColumn);
    for (const row of item.dataSource.rows) row.data[this.newColumn.name] = null;
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource) return;
    item.dataSource.columns = item.dataSource.columns.filter((column) => column.name !== this.newColumn.name);
    for (const column of item.dataSource.columns) if (column.order > this.columnIndex) column.order--;
    for (const row of item.dataSource.rows) delete row.data[this.newColumn.name];
  }
}
