import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";

export class MoveColumnCommand extends ADataSourceCommand<CommandType.MoveColumn> {
  readonly type = CommandType.MoveColumn;

  get description() {
    return `Move "${this.columnName}" (Column ${this.fromIndex + 1}) to "${this.toColumnName}" (Column ${this.toIndex + 1})`;
  }

  private readonly columnName: string;
  private readonly fromIndex: number;
  private readonly toColumnName: string;
  private readonly toIndex: number;

  constructor(fromIndex: number, toIndex: number, columnName: string, toColumnName: string) {
    super();
    this.columnName = columnName;
    this.fromIndex = fromIndex;
    this.toColumnName = toColumnName;
    this.toIndex = toIndex;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const columns = [...item.dataSource.columns];
    const [moved] = columns.splice(this.fromIndex, 1);
    if (!moved) return;
    columns.splice(this.toIndex, 0, moved);
    item.dataSource.columns = columns;
    for (const row of item.dataSource.rows)
      row.data = Object.fromEntries(columns.map(({ name }) => [name, row.data[name] ?? null]));
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const columns = [...item.dataSource.columns];
    const [moved] = columns.splice(this.toIndex, 1);
    if (!moved) return;
    columns.splice(this.fromIndex, 0, moved);
    item.dataSource.columns = columns;
    for (const row of item.dataSource.rows)
      row.data = Object.fromEntries(columns.map(({ name }) => [name, row.data[name] ?? null]));
  }
}
