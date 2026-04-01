import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { takeOne } from "@esposter/shared";

export class MoveColumnCommand extends ADataSourceCommand<CommandType.MoveColumn> {
  readonly type = CommandType.MoveColumn;

  get description() {
    return `Move "${this.columnName}" (Column ${this.fromOrder + 1}) to "${this.toColumnName}" (Column ${this.toOrder + 1})`;
  }

  private readonly columnName: string;
  private readonly fromOrder: number;
  private readonly toColumnName: string;
  private readonly toOrder: number;

  constructor(fromOrder: number, toOrder: number, columnName: string, toColumnName: string) {
    super();
    this.columnName = columnName;
    this.fromOrder = fromOrder;
    this.toColumnName = toColumnName;
    this.toOrder = toOrder;
  }

  protected doExecute(item: DataSourceItem) {
    this.shiftOrders(item, this.fromOrder, this.toOrder);
  }

  protected doUndo(item: DataSourceItem) {
    this.shiftOrders(item, this.toOrder, this.fromOrder);
  }

  private shiftOrders(item: DataSourceItem, fromOrder: number, toOrder: number) {
    if (!item.dataSource) return;
    const { columns } = item.dataSource;
    if (fromOrder < toOrder)
      for (const column of columns)
        if (column.order === fromOrder) column.order = toOrder;
        else if (column.order > fromOrder && column.order <= toOrder) column.order--;
        else if (fromOrder > toOrder)
          for (const column of columns)
            if (column.order === fromOrder) column.order = toOrder;
            else if (column.order >= toOrder && column.order < fromOrder) column.order++;
    const sortedColumns = columns.toSorted((a, b) => a.order - b.order);
    const columnNames = sortedColumns.map((column) => column.name);
    for (const row of item.dataSource.rows) {
      const newData: typeof row.data = {};
      for (const name of columnNames) newData[name] = takeOne(row.data, name);
      row.data = newData;
    }
  }
}
